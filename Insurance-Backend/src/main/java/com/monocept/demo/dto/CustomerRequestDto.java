package com.monocept.demo.dto;


import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerRequestDto {

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be a past date")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Pattern(regexp = "^[A-Za-z ]{2,50}$", message = "City must contain only letters and spaces (2-50 characters)")
    private String city;

    @NotBlank(message = "State is required")
    @Pattern(regexp = "^[A-Za-z ]{2,50}$", message = "State must contain only letters and spaces (2-50 characters)")
    private String state;

    @NotBlank(message = "PIN code is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "PIN code must be a valid 6-digit code")
    private String pinCode;

    // Nominee name is only accepted when the profile is first created.
    // On update, this value is ignored by the service layer - the original
    // nominee name is preserved and cannot be changed by the customer.
    @NotBlank(message = "Nominee name is required")
    @Pattern(regexp = "^[A-Za-z ]{2,100}$", message = "Nominee name must contain only letters and spaces (2-100 characters)")
    private String nomineeName;

    @NotBlank(message = "Nominee relation is required")
    @Pattern(regexp = "^[A-Za-z ]{2,50}$", message = "Nominee relation must contain only letters and spaces (2-50 characters)")
    private String nomineeRelation;
}