package com.monocept.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.monocept.demo.dto.ForgotPasswordRequestDto;
import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;
import com.monocept.demo.dto.ResetPasswordRequestDto;
import com.monocept.demo.dto.VerifyOtpRequestDto;
import com.monocept.demo.entity.PasswordResetToken;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.OtpChannel;
import com.monocept.demo.enums.Role;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.InactiveUserException;
import com.monocept.demo.exception.InvalidTokenException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.PasswordResetTokenRepository;
import com.monocept.demo.repository.UserRepository;
import com.monocept.demo.security.JwtService;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    private final SmsService smsService;

    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void register(RegisterRequestDto dto) {
        User existingByEmail = userRepository.findByEmail(dto.getEmail()).orElse(null);

        if (existingByEmail != null && existingByEmail.isActive()) {
            throw new DuplicateResourceException("Email already exists");
        }
        if (existingByEmail == null && userRepository.existsByMobileNumber(dto.getMobileNumber())) {
            throw new DuplicateResourceException("Mobile number already exists");
        }
        if (existingByEmail != null && !existingByEmail.getMobileNumber().equals(dto.getMobileNumber())
                && userRepository.existsByMobileNumber(dto.getMobileNumber())) {
            throw new DuplicateResourceException("Mobile number already exists");
        }

        // Generate 6-digit OTP with 15-minute expiry
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        // If the user already exists but never verified their OTP, reuse and
        // update that record instead of blocking with a duplicate-email error.
        User user = (existingByEmail != null) ? existingByEmail : new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setMobileNumber(dto.getMobileNumber());
        user.setRole(Role.CUSTOMER);
        user.setActive(false);
        user.setOtp(otp);
        user.setOtpExpiryTime(expiryTime);

        userRepository.save(user);

        // Route OTP to the chosen channel
        OtpChannel channel = (dto.getOtpChannel() != null) ? dto.getOtpChannel() : OtpChannel.EMAIL;

        if (channel == OtpChannel.PHONE) {
            smsService.sendOtpSms(dto.getMobileNumber(), otp);
        } else {
            sendOtpEmail(dto.getEmail(), otp);
        }
    }

    @Override
    public void verifyOtp(VerifyOtpRequestDto dto) {
        User user = resolveUser(dto);

        if (user.getOtp() == null || !user.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP code");
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        user.setActive(true);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }

    /**
     * Resolves the user by email OR mobile number from the verify-OTP request.
     * The frontend should send whichever identifier the customer used to receive the OTP.
     */
    private User resolveUser(VerifyOtpRequestDto dto) {
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            return userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + dto.getEmail()));
        }
        if (dto.getMobileNumber() != null && !dto.getMobileNumber().isBlank()) {
            return userRepository.findByMobileNumber(dto.getMobileNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with mobile: " + dto.getMobileNumber()));
        }
        throw new IllegalArgumentException("Provide either email or mobileNumber to verify OTP");
    }

    private void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmailAddress);
        message.setTo(toEmail);
        message.setSubject("Email Verification - Insurance Policy Management System");
        message.setText("Thank you for signing up! Your registration OTP verification code is: " + otp
                + "\nThis code will expire in 15 minutes.");
        mailSender.send(message);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new InactiveUserException("User account inactive. Please verify your OTP first.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponseDto(token, "Bearer", user.getEmail(), user.getRole().name(), 86400000L);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + dto.getEmail()));

        // Generate a random, unique, one-time-use reset token with 15-minute expiry
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryTime(expiryTime);
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        sendResetPasswordEmail(user.getEmail(), token);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDto dto) {
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new InvalidTokenException("New password and confirm password do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset link"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This reset link has already been used");
        }

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("This reset link has expired. Please request a new one");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private void sendResetPasswordEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmailAddress);
        message.setTo(toEmail);
        message.setSubject("Reset Your Password - Insurance Policy Management System");
        message.setText("We received a request to reset your password.\n"
                + "Click the link below to set a new password:\n" + resetLink
                + "\nThis link will expire in 15 minutes.\n"
                + "If you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}
