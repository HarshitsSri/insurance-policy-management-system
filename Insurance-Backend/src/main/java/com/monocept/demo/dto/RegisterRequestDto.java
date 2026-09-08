package com.monocept.demo.dto;

import com.monocept.demo.enums.OtpChannel;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDto {

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 80, message = "Full name must be between 3 and 80 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter and one number")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^(?:\\+91|91)?[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
    private String mobileNumber;

    /**
     * Choose how to receive the OTP.
     * Accepted values: EMAIL or PHONE
     * Defaults to EMAIL if not provided.
     */
    @NotNull(message = "OTP channel is required")
    private OtpChannel otpChannel = OtpChannel.EMAIL;
}
