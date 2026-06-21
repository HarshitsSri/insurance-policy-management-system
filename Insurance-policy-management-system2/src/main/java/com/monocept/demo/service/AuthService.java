package com.monocept.demo.service;

import com.monocept.demo.dto.LoginRequestDto;
import com.monocept.demo.dto.LoginResponseDto;
import com.monocept.demo.dto.RegisterRequestDto;


public interface AuthService {

    void register(RegisterRequestDto dto);

    LoginResponseDto login(LoginRequestDto dto);
}
