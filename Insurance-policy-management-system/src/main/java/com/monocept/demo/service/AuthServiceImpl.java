package com.monocept.demo.service;

import org.springframework.beans.factory.annotation.Value; // Import Value annotation
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;
import com.monocept.demo.dto.VerifyOtpRequestDto;
import com.monocept.demo.entity.User;
import com.monocept.demo.enums.Role;
import com.monocept.demo.exception.DuplicateResourceException;
import com.monocept.demo.exception.InactiveUserException;
import com.monocept.demo.exception.ResourceNotFoundException;
import com.monocept.demo.repository.UserRepository;
import com.monocept.demo.security.JwtService;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;

    // Dynamically fetch the username configured in application.properties
    @Value("${spring.mail.username}")
    private String fromEmailAddress;

    @Override
    public void register(RegisterRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        // 1. Generate 6-digit OTP and set expiry time (15 minutes)
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);

        // 2. Map and Save user as INACTIVE until OTP is verified
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setMobileNumber(dto.getMobileNumber());
        user.setRole(Role.CUSTOMER);
        user.setActive(false); 
        user.setOtp(otp);
        user.setOtpExpiryTime(expiryTime);

        userRepository.save(user);

        // 3. Send email to user
        sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(dto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP code");
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        // Activation step
        user.setActive(true);
        user.setOtp(null); 
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }

    private void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        // FIX: Explicitly specify who is sending the mail to resolve the MessagingException
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
            throw new InactiveUserException("User account inactive. Please verify your email first.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponseDto(token, "Bearer", user.getEmail(), user.getRole().name(), 86400000L);
    }
}