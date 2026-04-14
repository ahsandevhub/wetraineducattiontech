import type { HrmRole } from "@/app/utils/auth/roles";

export const HRM_TASK_REPORT_CATEGORIES = [
  "Customer Handling",
  "KYC Check",
  "Review",
  "Follow-up",
  "Documentation",
  "Meeting",
  "Support",
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
