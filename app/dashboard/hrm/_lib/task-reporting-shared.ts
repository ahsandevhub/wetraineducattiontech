import type { HrmRole } from "@/app/utils/auth/roles";

export const HRM_TASK_REPORT_CATEGORY_SECTIONS = [
  {
    label: "Marketing",
    categories: [
      "Social Media Engagement",
      "Facebook Community Engagement",
    ],
  },
  {
    label: "Customer Service",
    categories: [
      "Customer Handling",
      "Replied Customer",
      "Re-assigned Tickets",
      "Ticket Create",
      "Ticket Management",
      "HubSpot Help Desk",
      "Meta (Facebook/Instagram)",
      "Telegram Support",
      "Customer Query Handling",
      "Customer Issue Resolution",
      "Phone Call Support",
      "Follow-up",
      "Support",
      "Customer Communication",
      "Maintain Customer Relationship",
    ],
  },
  {
    label: "Operations",
    categories: [
      "General Ticket Handling",
      "Create Discount/AP Code",
      "Create GA/BOGO Account",
      "Create Payout Ticket",
      "Checking Payment & Send Contract",
      "Checking Account Reset",
      "Checking Payout",
      "Update Withdraw Status",
      "Trading Support",
      "Payout & Account Checking",
      "KYC Check",
      "Store Management",
    ],
  },
  {
    label: "Content Creation",
    categories: [
      "Content Writing",
      "Script Writing",
      "Social Media Post",
      "Video Shoot",
      "Video Edit",
    ],
  },
  {
    label: "Administrative",
    categories: [
      "Review Check",
      "Internal Coordination",
      "Documentation",
      "Meeting",
      "Process Documentation",
      "Training Materials",
    ],
  },
  {
    label: "Technical",
    categories: ["IT Task"],
  },
  {
    label: "Other",
    categories: ["Other"],
  },
] as const;

export const HRM_TASK_REPORT_CATEGORIES =
  HRM_TASK_REPORT_CATEGORY_SECTIONS.flatMap((section) => section.categories);

export type HrmTaskReportCategory = (typeof HRM_TASK_REPORT_CATEGORIES)[number];
export type HrmTaskReportCategorySection =
  (typeof HRM_TASK_REPORT_CATEGORY_SECTIONS)[number]["label"];
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
