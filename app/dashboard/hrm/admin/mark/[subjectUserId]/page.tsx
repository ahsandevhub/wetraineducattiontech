"use client";

import { MarkingForm } from "@/components/hrm/admin/MarkingForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatWeekDisplay } from "@/lib/hrm/week-utils";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

type SubjectData = {
  subject: {
    id: string;
    fullName: string;
    email: string;
    hrmRole: string;
  };
  criteriaSet: {
    id: string;
    activeFrom: string;
    items: CriteriaItem[];
  } | null;
  existingSubmission: {
    id: string;
    totalScore: number;
    comment: string | null;
    items: Array<{ criteriaId: string; scoreRaw: number }>;
  } | null;
  weekStatus: string;
};

export default function MarkingFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectUserId = params.subjectUserId as string;
  const weekKey = searchParams.get("weekKey");

  const [data, setData] = useState<SubjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/hrm/admin/subject/${subjectUserId}?weekKey=${weekKey}`,
      );
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      setData(result);
      setIsLocked(result.weekStatus === "LOCKED");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load subject data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (weekKey) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey, subjectUserId]);

  const handleSubmit = async (formData: {
    scores: Record<string, number>;
    comment: string;
  }) => {
    try {
      const items = Object.entries(formData.scores).map(
        ([criteriaId, scoreRaw]) => ({
          criteriaId,
          scoreRaw,
        }),
      );

      const res = await fetch("/api/hrm/admin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekKey,
          subjectUserId,
          comment: formData.comment,
          items,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      toast.success(
        `Marks submitted successfully! Total Score: ${result.totalScore.toFixed(
          2,
        )}`,
      );
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit marks";
      toast.error(message);
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!data || !data.criteriaSet) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Criteria Not Configured</AlertTitle>
          <AlertDescription>
            This subject does not have an active criteria set. Please contact a
            Super Admin to configure their evaluation criteria.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const existingScores =
    data.existingSubmission?.items.reduce(
      (acc, item) => {
        acc[item.criteriaId] = item.scoreRaw;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {isLocked ? "View Marks" : "Mark Subject"}
        </h1>
        <p className="text-muted-foreground">
          Week: {weekKey && formatWeekDisplay(weekKey)}
        </p>
      </div>

      {/* Locked Alert */}
      {isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Week Locked</AlertTitle>
          <AlertDescription>
            This week is locked. You can view but cannot edit this submission.
          </AlertDescription>
        </Alert>
      )}

      {/* Subject Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground">Name:</span>
              <div className="font-medium">{data.subject.fullName}</div>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground">Email:</span>
              <div className="font-medium">{data.subject.email}</div>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground">Role:</span>
              <div className="font-medium">{data.subject.hrmRole}</div>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground">Status:</span>
              <div className="font-medium">
                {data.existingSubmission ? "✅ Submitted" : "⏳ Pending"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkingForm
            criteriaItems={data.criteriaSet.items}
            existingScores={existingScores}
            existingComment={data.existingSubmission?.comment || ""}
            isLocked={isLocked}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
