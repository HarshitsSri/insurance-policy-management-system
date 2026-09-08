// Mirrors backend PremiumCalculator (see PremiumFrequency.java / PremiumCalculator.java).
// The backend is always the source of truth / final validator — this is only
// used to preview amounts in the UI before the request is sent.

export const PREMIUM_FREQUENCIES = ["MONTHLY", "HALF_YEARLY", "ANNUAL", "ONE_TIME"];

const ONE_TIME_DISCOUNT_FACTOR = 0.95; // 5% off, matches backend

export const premiumFrequencyLabel = (frequency) => {
  switch (frequency) {
    case "MONTHLY":
      return "Monthly";
    case "HALF_YEARLY":
      return "Half-yearly";
    case "ANNUAL":
      return "Annual";
    case "ONE_TIME":
      return "One-time";
    default:
      return frequency;
  }
};

export const premiumFrequencySuffix = (frequency) => {
  switch (frequency) {
    case "MONTHLY":
      return "/month";
    case "HALF_YEARLY":
      return "/half-year";
    case "ANNUAL":
      return "/year";
    case "ONE_TIME":
      return "one-time";
    default:
      return "";
  }
};

/**
 * @param annualPremium the plan's base annual premium (Admin-set)
 * @param frequency one of PREMIUM_FREQUENCIES
 * @param durationYears the plan's duration in years (needed for ONE_TIME)
 * @returns the amount payable per installment, rounded to 2 decimals
 */
export const calculateInstallmentAmount = (annualPremium, frequency, durationYears) => {
  const annual = Number(annualPremium ?? 0);
  const duration = Number(durationYears ?? 0);

  switch (frequency) {
    case "MONTHLY":
      return round2(annual / 12);
    case "HALF_YEARLY":
      return round2(annual / 2);
    case "ANNUAL":
      return round2(annual);
    case "ONE_TIME":
      return round2(annual * duration * ONE_TIME_DISCOUNT_FACTOR);
    default:
      return round2(annual);
  }
};

function round2(value) {
  return Math.round(value * 100) / 100;
}
