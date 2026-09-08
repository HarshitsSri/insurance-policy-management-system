

//------------------Used when a customer purchases a policy.----------------------

package com.monocept.demo.dto;

import java.time.LocalDate;

import com.monocept.demo.enums.PremiumFrequency;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerPolicyPurchaseRequestDto {

    @NotNull(message = "Plan id is required")
    private Long planId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in past")
    private LocalDate startDate;

    /**
     * How the customer wants to pay the premium: MONTHLY, HALF_YEARLY, ANNUAL
     * or ONE_TIME. The actual installment amount is calculated from the plan's
     * annual premium based on this choice.
     */
    @NotNull(message = "Premium frequency is required")
    private PremiumFrequency premiumFrequency;
}
