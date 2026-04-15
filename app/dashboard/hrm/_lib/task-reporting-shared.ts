import type { HrmRole } from "@/app/utils/auth/roles";

export const HRM_TASK_REPORT_CATEGORIES = [
  // Operational Tasks
  "General Ticket Handling",
  "Create Discount/AP Code",
  "Create GA/BOGO Account",
  "Create Payout Ticket",
  "Checking Payment & Send Contract",
  "Checking Account Reset",
  "Checking Payout",
  "Update Withdraw Status",

  // Core CS Work
  "Customer Handling",
  "Replied Customer",
  "Re-assigned Tickets",
  "Ticket Create",
  "Ticket Management",

  // Platform Handling
  "HubSpot Help Desk",
  "Meta (Facebook/Instagram)",
  "Telegram Support",
  "Social Media Engagement",
  "Facebook Community Engagement",

  // Customer Support Activities
  "Customer Query Handling",
  "Customer Issue Resolution",
  "Phone Call Support",
  "Follow-up",
  "Support",
  "Customer Communication",

  // Trading & Account Support
  "Trading Support",
  "Payout & Account Checking",
  "KYC Check",

  // Review & Feedback
  "Review Check",

  // Internal Work
  "Internal Coordination",
  "Documentation",
  "Meeting",

  // Content & Marketing
  "Content Writing",
  "Script Writing",
  "Social Media Post",
  "Video Shoot",
  "Video Edit",

  // Store & Ops
  "Store Management",

  // Technical & System
  "IT Task",
  "Process Documentation",
  "Training Materials",

  // Misc
  "Maintain Customer Relationship",
  "Other",
] as const;

export type HrmTaskReportCategory = (typeof HRM_TASK_REPORT_CATEGORIES)[number];
export type HrmReportingScope = "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";

export type HrmTaskReportRow = {
  id: string;
  author_user_id: string;
  category: HrmTaskReportCategory;
  task_title: string;
  proof_url: string | null;
  notes: string | null;
  reported_at: string;
  updated_at: string;
};

export type HrmTaskReportListItem = HrmTaskReportRow & {
  authorName: string | null;
  authorEmail: string | null;
  canEdit: boolean;
  canDelete: boolean;
  isOwnRecord: boolean;
};

export type HrmReportingFilters = {
  q: string;
  category: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type HrmReportingUserOption = {
  id: string;
  fullName: string;
  email: string;
};

export type HrmReportingPageData = {
  role: HrmRole;
  currentUserId: string;
  filters: HrmReportingFilters;
  items: HrmTaskReportListItem[];
  totalRows: number;
  totalPages: number;
  userOptions: HrmReportingUserOption[];
};
