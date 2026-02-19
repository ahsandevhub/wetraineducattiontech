/**
 * HRM KPI Scoring Utilities
 * Handles score computation and validation
 */

type CriteriaItem = {
  criteriaId: string;
  scaleMax: number;
  weightagePercent: number;
};

type SubmittedScore = {
  criteriaId: string;
  scoreRaw: number;
};

/**
 * Compute total score from submitted scores
 * Formula: For each criterion:
 *   - Normalize: (scoreRaw / scaleMax) * 100
 *   - Apply weight: normalized * (weight / 100)
 *   - Sum all weighted scores
 * Result: 0-100
 */
export function computeSubmissionTotal(
  criteriaItems: CriteriaItem[],
  submittedScores: SubmittedScore[],
): number {
  let totalScore = 0;

  for (const item of criteriaItems) {
    const score = submittedScores.find((s) => s.criteriaId === item.criteriaId);

    if (!score) {
      // Missing score for this criterion - treat as 0
      continue;
    }

    // Normalize to 0-100
    const normalized = (score.scoreRaw / item.scaleMax) * 100;

    // Apply weight
    const weighted = normalized * (item.weightagePercent / 100);

    totalScore += weighted;
  }

  // Round to 2 decimal places
  return Math.round(totalScore * 100) / 100;
}

/**
 * Validate submitted scores against criteria items
 */
export function validateSubmittedScores(
  criteriaItems: CriteriaItem[],
  submittedScores: SubmittedScore[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check all criteria have scores
  const submittedIds = new Set(submittedScores.map((s) => s.criteriaId));
  const requiredIds = new Set(criteriaItems.map((c) => c.criteriaId));

  for (const requiredId of requiredIds) {
    if (!submittedIds.has(requiredId)) {
      errors.push(`Missing score for criterion ${requiredId}`);
    }
  }

  // Validate each score is within range
  for (const score of submittedScores) {
    const item = criteriaItems.find((c) => c.criteriaId === score.criteriaId);
    if (!item) {
      errors.push(`Unknown criterion ${score.criteriaId}`);
      continue;
    }

    if (score.scoreRaw < 0 || score.scoreRaw > item.scaleMax) {
      errors.push(
        `Score for ${score.criteriaId} must be between 0 and ${item.scaleMax}`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compute live preview score for UI
 */
export function computeLivePreview(
  criteriaItems: CriteriaItem[],
  currentScores: Record<string, number>,
): number {
  const submittedScores = Object.entries(currentScores).map(
    ([criteriaId, scoreRaw]) => ({
      criteriaId,
      scoreRaw,
    }),
  );

  return computeSubmissionTotal(criteriaItems, submittedScores);
}
