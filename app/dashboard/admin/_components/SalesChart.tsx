"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminPaymentRow } from "../types";
import { formatCurrency } from "./formatters";

interface SalesChartProps {
  payments: AdminPaymentRow[];
}

export default function SalesChart({ payments }: SalesChartProps) {
  // Filter only paid sales
  const paidPayments = payments.filter((payment) => payment.status === "paid");

  // Get current month start and end
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date();

  // Filter payments for current month
  const currentMonthPayments = paidPayments.filter((payment) => {
    if (!payment.createdAt) return false;
    const paymentDate = new Date(payment.createdAt);
    return paymentDate >= currentMonthStart && paymentDate <= currentMonthEnd;
  });

  // Group sales by date for current month
  const salesByDate = currentMonthPayments.reduce(
    (acc, payment) => {
      const date = payment.createdAt
        ? new Date(payment.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Unknown";

      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.sales += payment.amount;
        existing.count += 1;
      } else {
        acc.push({
          date,
          sales: payment.amount,
          count: 1,
        });
      }
      return acc;
    },
    [] as Array<{ date: string; sales: number; count: number }>,
  );

  // Sort by date
  salesByDate.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { date: string; sales: number; count: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-sm font-medium">{data.date}</p>
          <p className="text-sm text-blue-600">
            Sales: {formatCurrency(data.sales)}
          </p>
          <p className="text-sm text-gray-600">Transactions: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report - Current Month</CardTitle>
        </CardHeader>
        <CardContent>
          {salesByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesByDate}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#efd777" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#efd777" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f5cb00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="Sales Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No paid sales data available for current month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
