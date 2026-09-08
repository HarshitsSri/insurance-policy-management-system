package com.monocept.demo.enums;

/**
 * How the customer has chosen to pay the premium for their policy.
 * Chosen by the customer (or the Agent/Admin issuing on their behalf) at the
 * time of purchase — NOT decided when the Admin creates the plan.
 *
 * The Admin only sets an annual premium amount on the PolicyPlan. The actual
 * amount payable per installment is derived from that annual premium based
 * on the frequency selected here (see PremiumCalculator).
 */
public enum PremiumFrequency {
    MONTHLY,
    HALF_YEARLY,
    ANNUAL,
    ONE_TIME
}
