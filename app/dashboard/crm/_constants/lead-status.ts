/**
 * Lead Status Constants - Single Source of Truth
 * Defines all valid lead statuses, their labels, and UI configurations
 */

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  PhoneCall,
  Sparkles,
  XCircle,
} from "lucide-react";

/**
 * Lead Status Type - All valid status values
 */
export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "SOLD"
  | "NOT_INTERESTED"
  | "NO_RESPONSE"
  | "INVALID_NUMBER";

/**
 * Status options for dropdowns and form controls
 * Order: New → Contacted → Interested → Sold (success path)
 *        Then: Not Interested, No Response, Invalid Number (negative paths)
 */
export const LEAD_STATUS_OPTIONS: Array<{
  value: LeadStatus;
  label: string;
}> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "SOLD", label: "Sold" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "NO_RESPONSE", label: "No Response" },
  { value: "INVALID_NUMBER", label: "Invalid Number" },
];

/**
 * Human-readable labels for each status
 */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  SOLD: "Sold",
  NOT_INTERESTED: "Not Interested",
  NO_RESPONSE: "No Response",
  INVALID_NUMBER: "Invalid Number",
};

/**
 * Badge UI configuration for status display
 * Includes icon and color variant for each status
 */
export const LEAD_STATUS_BADGE: Record<
  LeadStatus,
  {
    icon: typeof Sparkles;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  NEW: { icon: Sparkles, variant: "secondary" },
  CONTACTED: { icon: PhoneCall, variant: "outline" },
  INTERESTED: { icon: BadgeCheck, variant: "default" },
  SOLD: { icon: CheckCircle2, variant: "default" },
  NOT_INTERESTED: { icon: XCircle, variant: "destructive" },
  NO_RESPONSE: { icon: Clock, variant: "secondary" },
  INVALID_NUMBER: { icon: AlertTriangle, variant: "destructive" },
};

/**
 * Data migration mapping: old statuses → new statuses
 * Used for database migration to preserve lead history
 */
export const STATUS_MIGRATION_MAP: Record<string, LeadStatus> = {
  // Direct mappings
  NEW: "NEW",
  CONTACTED: "CONTACTED",

  // Consolidate interested statuses
  QUALIFIED: "INTERESTED",
  PROPOSAL: "INTERESTED",
  NEGOTIATION: "INTERESTED",

  // Success mapping
  WON: "SOLD",

  // Default negative mapping
  LOST: "NOT_INTERESTED",

  // Unknowns default to NEW
  NULL: "NEW",
};

/**
 * Status categories for metrics/dashboards
 */
export const LEAD_STATUS_CATEGORIES = {
  success: ["SOLD"] as const,
  active: ["NEW", "CONTACTED", "INTERESTED"] as const,
  negative: ["NOT_INTERESTED", "NO_RESPONSE", "INVALID_NUMBER"] as const,
  all: [
    "NEW",
    "CONTACTED",
    "INTERESTED",
    "SOLD",
    "NOT_INTERESTED",
    "NO_RESPONSE",
    "INVALID_NUMBER",
  ] as const,
};

/**
 * Validates if a given string is a valid LeadStatus
 * @param status - String to validate
 * @returns true if valid, false otherwise
 */
export function isValidLeadStatus(status: string): status is LeadStatus {
  return LEAD_STATUS_OPTIONS.some((opt) => opt.value === status);
}

/**
 * Validates and returns a valid LeadStatus or defaults to 'NEW'
 * @param status - Status to validate
 * @returns Valid LeadStatus (or 'NEW' as fallback)
 */
export function getValidLeadStatus(status: unknown): LeadStatus {
  if (typeof status === "string" && isValidLeadStatus(status)) {
    return status;
  }
  return "NEW";
}
