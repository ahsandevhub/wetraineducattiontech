"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeLivePreview } from "@/lib/hrm/scoring";
import { useEffect, useState } from "react";

type CriteriaItem = {
  id: string;
  criteriaId: string;
  weight: number;
  scaleMax: number;
  criteria: {
    id: string;
    key: string;
    name: string;
    description: string | null;
  };
};

type MarkingFormProps = {
  criteriaItems: CriteriaItem[];
  existingScores?: Record<string, number>;
  existingComment?: string;
  isLocked: boolean;
  onSubmit: (data: {
    scores: Record<string, number>;
    comment: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export function MarkingForm({
  criteriaItems,
  existingScores = {},
  existingComment = "",
  isLocked,
  onSubmit,
  onCancel,
}: MarkingFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(existingScores);
  const [comment, setComment] = useState(existingComment);
  const [submitting, setSubmitting] = useState(false);

  // Sync state when props change (for dialog pre-population)
  useEffect(() => {
    setScores(existingScores);
  }, [existingScores]);

  useEffect(() => {
    setComment(existingComment);
  }, [existingComment]);

  const handleScoreChange = (criteriaId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setScores((prev) => ({ ...prev, [criteriaId]: numValue }));
    } else {
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[criteriaId];
        return newScores;
      });
    }
  };

  const liveScore = computeLivePreview(
    criteriaItems.map((item) => ({
      criteriaId: item.criteriaId,
      scaleMax: item.scaleMax,
      weightagePercent: item.weight,
    })),
    scores,
  );

  const allScoresEntered =
    criteriaItems.length > 0 &&
    criteriaItems.every((item) => scores[item.criteriaId] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ scores, comment });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Criteria Scoring */}
      <div className="space-y-4">
        {criteriaItems.map((item) => (
          <div
            key={item.criteriaId}
            className="rounded-lg border p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label
                  htmlFor={item.criteriaId}
                  className="text-base font-semibold"
                >
                  {item.criteria.name}
                </Label>
                {item.criteria.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.criteria.description}
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Weight: {item.weight}%</div>
                <div>Max: {item.scaleMax}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id={item.criteriaId}
                  type="number"
                  min="0"
                  max={item.scaleMax}
                  step="0.01"
                  value={scores[item.criteriaId] ?? ""}
                  onChange={(e) =>
                    handleScoreChange(item.criteriaId, e.target.value)
                  }
                  placeholder={`0 - ${item.scaleMax}`}
                  disabled={isLocked}
                  className="text-lg font-mono"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                / {item.scaleMax}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Total Score */}
      <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Score:</span>
          <span className="text-3xl font-bold font-mono text-primary">
            {liveScore.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Out of 100 (weighted average)
        </p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Comment (Optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add any notes or observations..."
          rows={4}
          disabled={isLocked}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          {isLocked ? "Back" : "Cancel"}
        </Button>
        {!isLocked && (
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allScoresEntered}
          >
            {submitting ? "Submitting..." : "Submit Marks"}
          </Button>
        )}
      </div>
    </div>
  );
}
