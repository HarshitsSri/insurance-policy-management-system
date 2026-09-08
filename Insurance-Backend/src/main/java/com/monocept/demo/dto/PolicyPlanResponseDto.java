package com.monocept.demo.dto;


import com.monocept.demo.enums.ProductType;

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

    /** Base ANNUAL premium set by the Admin. Actual per-installment amount is
     *  calculated at purchase time based on the frequency the customer picks. */
    private Double premiumAmount;

    private Integer duration;

    private String termsAndConditions;

    private Boolean active;
}
