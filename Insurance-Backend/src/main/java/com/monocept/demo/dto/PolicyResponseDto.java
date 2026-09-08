package com.monocept.demo.dto;


import java.time.LocalDate;

import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.enums.PremiumFrequency;
import com.monocept.demo.enums.ProductType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyResponseDto {

    private Long policyId;

    private String policyNumber;

    private String customerName;

    private String planName;

    private ProductType productType;

    private Double coverageAmount;

    /** Base ANNUAL premium of the underlying plan, set by the Admin. */
    private Double annualPremiumAmount;

    /** How the customer chose to pay: MONTHLY / HALF_YEARLY / ANNUAL / ONE_TIME. */
    private PremiumFrequency premiumFrequency;

    /** The amount payable per installment for the chosen frequency. */
    private Double installmentAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    private PolicyStatus policyStatus;

    private Double totalPremiumPaid;
}
