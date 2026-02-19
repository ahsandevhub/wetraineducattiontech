/**
 * Debug: Reconciliation Panel
 * Development-only component to verify dashboard numbers align with leads page
 * Shows KPI counts and provides link to leads page with matching filters
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ReconciliationDebugPanelProps {
  crmUserId: string;
  rangeKey: string;
  fromISO?: string;
  toISO?: string;
  assignedTotal?: number;
  assignedSold?: number;
  assignedLost?: number;
  createdTotal?: number;
  createdSold?: number;
  createdLost?: number;
}

export function ReconciliationDebugPanel({
  crmUserId,
  rangeKey,
  fromISO,
  toISO,
  assignedTotal = 0,
  assignedSold = 0,
  assignedLost = 0,
  createdTotal = 0,
  createdSold = 0,
  createdLost = 0,
}: ReconciliationDebugPanelProps) {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  // In server component, we can't access window, so we'll provide a relative link builder

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold text-amber-900">
            🔍 Dev: KPI Reconciliation
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Config info */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium text-amber-900">CRM User ID:</span>
            <code className="break-all text-xs bg-amber-100 px-2 py-1 rounded">
              {crmUserId}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <span className="font-medium text-amber-900">Range:</span>
            <span className="text-amber-800">{rangeKey}</span>
          </div>

          {fromISO && (
            <div className="grid grid-cols-2 gap-1">
              <span className="font-medium text-amber-900">From:</span>
              <code className="text-xs bg-amber-100 px-2 py-1 rounded">
                {fromISO.split("T")[0]}
              </code>
            </div>
          )}

          {toISO && (
            <div className="grid grid-cols-2 gap-1">
              <span className="font-medium text-amber-900">To:</span>
              <code className="text-xs bg-amber-100 px-2 py-1 rounded">
                {toISO.split("T")[0]}
              </code>
            </div>
          )}
        </div>

        {/* Assigned vs Created comparison */}
        <div className="border-t border-amber-200 pt-2">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Assigned */}
            <div className="space-y-1">
              <div className="font-medium text-amber-900 text-xs">Assigned</div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span>Total:</span>
                  <Badge variant="secondary">{assignedTotal}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Sold:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {assignedSold}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Lost:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {assignedLost}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Created */}
            <div className="space-y-1">
              <div className="font-medium text-amber-900 text-xs">Created</div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span>Total:</span>
                  <Badge variant="secondary">{createdTotal}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Sold:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {createdSold}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Lost:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {createdLost}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verify in leads page */}
        <div className="border-t border-amber-200 pt-2">
          <p className="text-xs font-medium text-amber-900 mb-2">
            📌 Verify numbers in Leads page:
          </p>
          <Link
            href="/dashboard/crm/leads"
            className="inline-flex items-center gap-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded transition-colors"
          >
            Open Leads Page
            <ExternalLink className="h-3 w-3" />
          </Link>
          <p className="text-xs text-amber-700 mt-1">
            Compare filters &quot;from&quot; and &quot;to&quot; with dashboard
            KPI cards above
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-amber-200 rounded p-2 text-xs">
          <p className="text-amber-900">
            ✓ Assigned total should match &quot;My Leads (Assigned)&quot; card
          </p>
          <p className="text-amber-900">
            ✓ Created total should match &quot;My Leads (Created)&quot; card
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
