/**
 * HRM Monthly Logic - Tier, Fine, and Action Type Computation
 * Phase 4: Monthly reporting and payroll outcomes
 */

export type HrmTier = "BONUS" | "APPRECIATION" | "IMPROVEMENT" | "FINE";
export type HrmActionType =
  | "BONUS"
  | "GIFT"
  | "APPRECIATION"
  | "SHOW_CAUSE"
  | "FINE"
  | "NONE";

export type MonthlyComputeResult = {
  tier: HrmTier;
  actionType: HrmActionType;
  baseFine: number;
  monthFineCount: number;
  finalFine: number;
  giftType: HrmActionType | null;
};

/**
 * Compute tier based on monthly score
 * 90-100 => BONUS
 * 80-89 => APPRECIATION
 * 70-79 => IMPROVEMENT
 * <70 => FINE
 */
export function computeTier(monthlyScore: number): HrmTier {
  if (monthlyScore >= 90) return "BONUS";
  if (monthlyScore >= 80) return "APPRECIATION";
  if (monthlyScore >= 70) return "IMPROVEMENT";
  return "FINE";
}

/**
 * Compute base fine based on score bands
 * 60-69 => 300
 * 50-59 => 600
 * <50 => 1000
 * Returns 0 if score >= 70
 */
export function computeScoreBandBaseFine(monthlyScore: number): number {
  if (monthlyScore >= 70) return 0;
  if (monthlyScore >= 60) return 300;
  if (monthlyScore >= 50) return 600;
  return 1000;
}

/**
 * Check if repeated improvement punishment applies
 * Triggers when current month tier = IMPROVEMENT AND previous month tier = IMPROVEMENT
 * Returns baseFine = 300 if true, else 0
 */
export function computeRepeatedImprovementFine(
  currentTier: HrmTier,
  previousMonthTier: HrmTier | null,
): number {
  if (currentTier === "IMPROVEMENT" && previousMonthTier === "IMPROVEMENT") {
    return 300;
  }
  return 0;
}

/**
 * Compute final base fine
 * Priority: If score-based fine zone (score < 70), use score-band fine
 * Otherwise, check repeated improvement punishment
 */
export function computeBaseFine(
  monthlyScore: number,
  previousMonthTier: HrmTier | null,
): number {
  const currentTier = computeTier(monthlyScore);
  const scoreBandFine = computeScoreBandBaseFine(monthlyScore);

  // If already in fine zone, use score-band fine (dominates)
  if (scoreBandFine > 0) {
    return scoreBandFine;
  }

  // Check repeated improvement punishment
  const repeatedFine = computeRepeatedImprovementFine(
    currentTier,
    previousMonthTier,
  );
  return repeatedFine;
}

/**
 * Compute action type based on tier
 */
export function computeActionType(
  tier: HrmTier,
  baseFine: number,
): HrmActionType {
  if (tier === "BONUS") return "BONUS";
  if (tier === "APPRECIATION") return "APPRECIATION";
  if (tier === "IMPROVEMENT") {
    // If baseFine > 0, it's from repeated improvement punishment
    return baseFine > 0 ? "FINE" : "SHOW_CAUSE";
  }
  if (tier === "FINE") return "FINE";
  return "NONE";
}

/**
 * Compute gift type for reward zone (BONUS/APPRECIATION)
 */
export function computeGiftType(tier: HrmTier): HrmActionType | null {
  if (tier === "BONUS") return "BONUS";
  if (tier === "APPRECIATION") return "APPRECIATION";
  return null;
}

/**
 * Complete monthly computation
 */
export function computeMonthlyResult(
  monthlyScore: number,
  previousMonthTier: HrmTier | null,
): MonthlyComputeResult {
  const tier = computeTier(monthlyScore);
  const baseFine = computeBaseFine(monthlyScore, previousMonthTier);

  // monthFineCount: deterministic, 0 or 1
  const monthFineCount = baseFine > 0 ? 1 : 0;
  const finalFine = baseFine * monthFineCount;

  const actionType = computeActionType(tier, baseFine);
  const giftType = computeGiftType(tier);

  return {
    tier,
    actionType,
    baseFine,
    monthFineCount,
    finalFine,
    giftType,
  };
}

/**
 * Update consecutive improvement months counter
 * Returns new consecutiveImprovementMonths value
 */
export function updateConsecutiveImprovementMonths(
  currentTier: HrmTier,
  previousConsecutiveCount: number,
): number {
  if (currentTier === "IMPROVEMENT") {
    return previousConsecutiveCount + 1;
  }
  return 0; // Reset if not improvement
}
