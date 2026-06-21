package com.monocept.demo.dto;


import java.time.LocalDate;

import com.monocept.demo.enums.PolicyStatus;
import com.monocept.demo.enums.PremiumType;
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

    private Double premiumAmount;

    private PremiumType premiumType;

    private LocalDate startDate;

    private LocalDate endDate;

    private PolicyStatus policyStatus;

    private Double totalPremiumPaid;
}
