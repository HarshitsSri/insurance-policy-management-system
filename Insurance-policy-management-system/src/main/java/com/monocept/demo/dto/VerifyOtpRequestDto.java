package com.monocept.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequestDto {
    private String email;
    private String otp;
}