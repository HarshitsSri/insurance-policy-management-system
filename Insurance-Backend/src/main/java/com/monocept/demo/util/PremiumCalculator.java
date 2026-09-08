package com.monocept.demo.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.monocept.demo.enums.PremiumFrequency;

/**
 * Central place for turning the Admin-set ANNUAL premium (stored on
 * PolicyPlan) into the amount the customer actually has to pay, based on the
 * payment frequency they picked while purchasing the policy.
 *
 * Admin decides:   annual premium amount (PolicyPlan.premiumAmount)
 * Customer decides: how they want to pay it -> MONTHLY / HALF_YEARLY / ANNUAL / ONE_TIME
 * This class turns those two things into the per-installment amount.
 */
public final class PremiumCalculator {

    // One-time (single lump-sum covering the whole policy duration) is offered
    // at a small discount versus paying annually every year.
    private static final BigDecimal ONE_TIME_DISCOUNT_FACTOR = new BigDecimal("0.95"); // 5% off

    private PremiumCalculator() {
    }

    /**
     * @param annualPremium the base annual premium set by the Admin on the plan
     * @param frequency     the frequency the customer chose at purchase time
     * @param durationYears the plan's total duration in years (needed for ONE_TIME)
     * @return the amount payable per installment for the chosen frequency
     */
    public static BigDecimal calculateInstallmentAmount(BigDecimal annualPremium, PremiumFrequency frequency,
            int durationYears) {

        if (annualPremium == null || frequency == null) {
            throw new IllegalArgumentException("Annual premium and premium frequency are required.");
        }

        switch (frequency) {
        case MONTHLY:
            return annualPremium.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

        case HALF_YEARLY:
            return annualPremium.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);

        case ANNUAL:
            return annualPremium.setScale(2, RoundingMode.HALF_UP);

        case ONE_TIME:
            return annualPremium.multiply(BigDecimal.valueOf(durationYears)).multiply(ONE_TIME_DISCOUNT_FACTOR)
                    .setScale(2, RoundingMode.HALF_UP);

        default:
            throw new IllegalArgumentException("Unsupported premium frequency: " + frequency);
        }
    }

    /**
     * How many successful payments are expected per calendar year for the given
     * frequency. Used to enforce "you can't pay twice for the same period".
     */
    public static int installmentsPerYear(PremiumFrequency frequency) {
        switch (frequency) {
        case MONTHLY:
            return 12;
        case HALF_YEARLY:
            return 2;
        case ANNUAL:
            return 1;
        case ONE_TIME:
            return 0; // handled separately - only ever one payment, total
        default:
            throw new IllegalArgumentException("Unsupported premium frequency: " + frequency);
        }
    }
}
