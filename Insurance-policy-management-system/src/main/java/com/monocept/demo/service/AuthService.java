package com.monocept.demo.service;

import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;
import com.monocept.demo.dto.VerifyOtpRequestDto;


public interface AuthService {

    void register(RegisterRequestDto dto);
    void verifyOtp(VerifyOtpRequestDto dto);
    LoginResponseDto login(LoginRequestDto dto);
}
