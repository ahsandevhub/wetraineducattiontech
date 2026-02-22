/**
 * Marketer Status Breakdown Table
 * Shows lead count by status in a table format
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBreakdown } from "./crm-metrics";

interface CrmStatusBreakdownTableProps {
  breakdown: StatusBreakdown[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NEW: { bg: "bg-blue-100", text: "text-blue-800" },
  CONTACTED: { bg: "bg-yellow-100", text: "text-yellow-800" },
  QUALIFIED: { bg: "bg-purple-100", text: "text-purple-800" },
  PROPOSAL: { bg: "bg-indigo-100", text: "text-indigo-800" },
  WON: { bg: "bg-green-100", text: "text-green-800" },
  LOST: { bg: "bg-red-100", text: "text-red-800" },
};

function getStatusColor(status: string) {
  return (
    STATUS_COLORS[status] || { bg: "bg-slate-100", text: "text-slate-800" }
  );
}

export function CrmStatusBreakdownTable({
  breakdown,
}: CrmStatusBreakdownTableProps) {
  if (breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500">No leads found</p>
        </CardContent>
      </Card>
    );
  }

  const totalLeads = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((item) => {
                const color = getStatusColor(item.status);
                return (
                  <TableRow key={item.status}>
                    <TableCell>
                      <Badge
                        className={`${color.bg} ${color.text} border-0`}
                        variant="secondary"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-slate-900"
                            style={{
                              width: `${item.percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 w-10 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between">
            <span className="font-medium text-slate-700">Total</span>
            <span className="font-bold text-slate-900">{totalLeads}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
