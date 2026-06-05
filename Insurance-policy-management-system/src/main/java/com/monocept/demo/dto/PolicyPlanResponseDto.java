package com.monocept.demo.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyPlanResponseDto {

    private Long planId;

    private String productName;

    private ProductType productType;

    private String planName;

    private Double coverageAmount;

    private Double premiumAmount;

    private PremiumType premiumType;

    private Integer duration;

    private String termsAndConditions;

    private Boolean active;
}