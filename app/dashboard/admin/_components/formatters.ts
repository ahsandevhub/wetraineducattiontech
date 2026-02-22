import type { BadgeVariant } from "../types";

export const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const getStatusColor = (status: string): BadgeVariant => {
  const lowercaseStatus = status.toLowerCase();
  if (
    lowercaseStatus === "paid" ||
    lowercaseStatus === "completed" ||
    lowercaseStatus === "resolved"
  )
    return "default";
  if (
    lowercaseStatus === "pending" ||
    lowercaseStatus === "processing" ||
    lowercaseStatus === "in progress"
  )
    return "secondary";
  return "destructive";
};
