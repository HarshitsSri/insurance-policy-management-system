package com.monocept.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.monocept.demo.dto.ForgotPasswordRequestDto;
import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;
import com.monocept.demo.dto.ResetPasswordRequestDto;
import com.monocept.demo.dto.VerifyOtpRequestDto;
import com.monocept.demo.enums.OtpChannel;
import com.monocept.demo.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequestDto dto) {
        authService.register(dto);

        OtpChannel channel = (dto.getOtpChannel() != null) ? dto.getOtpChannel() : OtpChannel.EMAIL;
        String message = (channel == OtpChannel.PHONE)
                ? "Registration initiated. Please check your phone for the OTP."
                : "Registration initiated. Please check your email for the OTP.";

        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequestDto dto) {
        authService.verifyOtp(dto);
        return ResponseEntity.ok("OTP verified successfully! You can now log in.");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto dto) {
        authService.forgotPassword(dto);
        return ResponseEntity.ok("If an account exists with this email, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequestDto dto) {
        authService.resetPassword(dto);
        return ResponseEntity.ok("Password reset successfully! You can now log in with your new password.");
    }
}
