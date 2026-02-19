"use client";

import { CriteriaSetBuilder } from "@/components/hrm/CriteriaSetBuilder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

type ActiveCriteriaSet = {
  id: string;
  version: number;
  activeFrom: string;
  items: {
    criteriaId: string;
    scaleMax: number;
    weightagePercent: number;
  }[];
};

export default function CriteriaSetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectUserId = params.subjectUserId as string;

  const [subject, setSubject] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [criteria, setCriteria] = useState<HrmCriteria[]>([]);
  const [activeSet, setActiveSet] = useState<ActiveCriteriaSet | null>(null);
  const [items, setItems] = useState<CriteriaSetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch criteria library
      const criteriaRes = await fetch("/api/hrm/super/criteria");
      const criteriaResult = await criteriaRes.json();
      if (!criteriaRes.ok) throw new Error("Failed to fetch criteria");
      setCriteria(criteriaResult.criteria);

      // Fetch subject's active criteria set
      const setRes = await fetch(
        `/api/hrm/super/criteria-sets/${subjectUserId}`,
      );
      const setResult = await setRes.json();
      if (!setRes.ok) throw new Error("Failed to fetch criteria set");

      setSubject(setResult.subject);
      setActiveSet(setResult.activeSet);
      setItems(
        setResult.activeSet?.items.map((item: any) => ({
          criteriaId: item.criteriaId,
          scaleMax: item.scaleMax,
          weightagePercent: item.weight,
        })) || [],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectUserId]);

  const handleSave = async () => {
    // Validate total weight
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weightagePercent,
      0,
    );
    if (totalWeight !== 100) {
      toast.error("Total weight must equal 100%");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one criteria");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/hrm/super/criteria-sets/${subjectUserId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              criteriaId: item.criteriaId,
              weight: item.weightagePercent,
              scaleMax: item.scaleMax,
            })),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save criteria set");
      }

      toast.success("Criteria set saved successfully");
      router.push("/dashboard/hrm/super/criteria-sets");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save criteria set";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/hrm/super/criteria-sets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Configure Criteria Set</h1>
        <p className="text-muted-foreground">
          {subject?.full_name} ({subject?.email})
        </p>
        {activeSet && (
          <p className="text-sm text-muted-foreground mt-1">
            Current version: {activeSet.version} (active since{" "}
            {new Date(activeSet.activeFrom).toLocaleDateString()})
          </p>
        )}
      </div>

      <CriteriaSetBuilder
        criteria={criteria}
        items={items}
        onChange={setItems}
      />

      <div className="flex justify-end gap-2">
        <Link href="/dashboard/hrm/super/criteria-sets">
          <Button variant="outline" disabled={saving}>
            Cancel
          </Button>
        </Link>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Criteria Set"}
        </Button>
      </div>
    </div>
  );
}
