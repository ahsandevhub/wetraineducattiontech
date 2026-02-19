"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

type HrmCriteria = {
  id: string;
  key: string;
  name: string;
  default_scale_max: number;
};

type CriteriaSetItem = {
  criteriaId: string;
  scaleMax: number;
  weightagePercent: number;
};

type CriteriaSetBuilderProps = {
  criteria: HrmCriteria[];
  items: CriteriaSetItem[];
  onChange: (items: CriteriaSetItem[]) => void;
};

export function CriteriaSetBuilder({
  criteria,
  items,
  onChange,
}: CriteriaSetBuilderProps) {
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>("");

  const totalWeight = items.reduce(
    (sum, item) => sum + item.weightagePercent,
    0,
  );

  const addCriteria = () => {
    if (!selectedCriteriaId) return;

    const criterion = criteria.find((c) => c.id === selectedCriteriaId);
    if (!criterion) return;

    // Check if already added
    if (items.some((item) => item.criteriaId === selectedCriteriaId)) {
      return;
    }

    const newItem: CriteriaSetItem = {
      criteriaId: selectedCriteriaId,
      scaleMax: criterion.default_scale_max,
      weightagePercent: 0,
    };

    onChange([...items, newItem]);
    setSelectedCriteriaId("");
  };

  const removeCriteria = (criteriaId: string) => {
    onChange(items.filter((item) => item.criteriaId !== criteriaId));
  };

  const updateItem = (
    criteriaId: string,
    field: keyof CriteriaSetItem,
    value: number,
  ) => {
    onChange(
      items.map((item) =>
        item.criteriaId === criteriaId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const availableCriteria = criteria.filter(
    (c) => !items.some((item) => item.criteriaId === c.id),
  );

  return (
    <div className="space-y-4">
      {/* Add Criteria */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={selectedCriteriaId}
            onValueChange={setSelectedCriteriaId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select criteria to add" />
            </SelectTrigger>
            <SelectContent>
              {availableCriteria.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addCriteria} disabled={!selectedCriteriaId}>
          Add Criteria
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => {
          const criterion = criteria.find((c) => c.id === item.criteriaId);
          if (!criterion) return null;

          return (
            <div
              key={item.criteriaId}
              className="flex items-center gap-2 rounded-md border p-3"
            >
              <div className="flex-1">
                <div className="font-medium">{criterion.name}</div>
              </div>

              <div className="w-24">
                <Label className="text-xs">Scale Max</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={item.scaleMax}
                  onChange={(e) =>
                    updateItem(
                      item.criteriaId,
                      "scaleMax",
                      Number(e.target.value),
                    )
                  }
                />
              </div>

              <div className="w-24">
                <Label className="text-xs">Weight %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={item.weightagePercent}
                  onChange={(e) =>
                    updateItem(
                      item.criteriaId,
                      "weightagePercent",
                      Number(e.target.value),
                    )
                  }
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCriteria(item.criteriaId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No criteria selected. Add criteria above to build the set.
          </div>
        )}
      </div>

      {/* Total Weight Indicator */}
      {items.length > 0 && (
        <div className="flex items-center justify-between rounded-md bg-muted p-3">
          <span className="font-medium">Total Weight:</span>
          <Badge
            variant={totalWeight === 100 ? "default" : "destructive"}
            className="text-base"
          >
            {totalWeight}%
          </Badge>
        </div>
      )}
    </div>
  );
}
