package com.monocept.demo.service;
public interface AuthService {

    LoginResponseDto login(LoginRequestDto request);

    String registerCustomer(RegisterRequestDto request);
}
