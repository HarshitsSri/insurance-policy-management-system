package com.monocept.demo.dto;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyPlanRequestDto {

    @NotNull(message = "Product reference is required")
    private Long productId;

    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Coverage amount is required")
    @Min(value = 1, message = "Coverage amount must be greater than zero")
    private Double coverageAmount;

    /**
     * The base ANNUAL premium for this plan, decided by the Admin. Customers
     * choose how they want to pay this (monthly/half-yearly/annual/one-time)
     * at the time of purchase - that choice is NOT made here.
     */
    @NotNull(message = "Annual premium amount is required")
    @Min(value = 1, message = "Premium amount must be greater than zero")
    private Double premiumAmount;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be greater than zero")
    private Integer duration;

    @NotBlank(message = "Terms and conditions are required")
    private String termsAndConditions;

    @NotNull(message = "Active status is required")
    private Boolean active;
}
