package com.monocept.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequestDto {

    /**
     * Provide either email or mobileNumber to identify the user.
     * At least one must be present (enforced in AuthServiceImpl.resolveUser,
     * since exactly one of the two is required, not both).
     */
    private String email;

    private String mobileNumber;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be exactly 6 digits")
    private String otp;
}
