
//  ---------------Used by Admin or Agent.----------------


package com.monocept.demo.dto;


import java.time.LocalDate;

import com.monocept.demo.enums.PremiumFrequency;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyIssueRequestDto {

    @NotNull(message = "Customer id is required")
    private Long customerId;

    @NotNull(message = "Plan id is required")
    private Long planId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in past")
    private LocalDate startDate;

    /**
     * How the premium will be paid: MONTHLY, HALF_YEARLY, ANNUAL or ONE_TIME.
     */
    @NotNull(message = "Premium frequency is required")
    private PremiumFrequency premiumFrequency;
}
