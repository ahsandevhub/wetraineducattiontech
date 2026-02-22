/**
 * CRM Date Range Helper
 * Provides type-safe date range calculation and URL parameter handling
 */

export type CrmRangeKey = "this_month" | "last_7_days" | "all";

export interface CrmDateRange {
  key: CrmRangeKey;
  label: string;
  fromISO?: string; // ISO 8601 with time: YYYY-MM-DDTHH:mm:ss.sssZ
  toISO?: string;
}

/**
 * Get date range from search params
 * Defaults to "this_month" if not provided or invalid
 */
export function getCrmRange(searchParams?: {
  get?: (key: string) => string | null;
}): CrmDateRange {
  const rangeParam = searchParams?.get?.("range");

  // Validate range parameter
  const validRanges: CrmRangeKey[] = ["this_month", "last_7_days", "all"];
  const key: CrmRangeKey = validRanges.includes(rangeParam as CrmRangeKey)
    ? (rangeParam as CrmRangeKey)
    : "this_month";

  switch (key) {
    case "last_7_days":
      return getLastSevenDaysRange();
    case "all":
      return getAllTimeRange();
    case "this_month":
      return getThisMonthRange();
    default:
      return getThisMonthRange();
  }
}

/**
 * This Month: First day of current month 00:00:00 → End of today 23:59:59
 */
function getThisMonthRange(): CrmDateRange {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    key: "this_month",
    label: "This Month",
    fromISO: firstDay
      .toISOString()
      .replace(/T00:00:00.000Z$/, "T00:00:00.000Z"),
    toISO: new Date(
      lastDay.getFullYear(),
      lastDay.getMonth(),
      lastDay.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString(),
  };
}

/**
 * Last 7 Days: from now-6 days 00:00:00 → End of today 23:59:59
 */
function getLastSevenDaysRange(): CrmDateRange {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  return {
    key: "last_7_days",
    label: "Last 7 Days",
    fromISO: startDate.toISOString(),
    toISO: endDate.toISOString(),
  };
}

/**
 * All Time: No date filters
 */
function getAllTimeRange(): CrmDateRange {
  const now = new Date();
  const startDate = new Date(2000, 0, 1);

  return {
    key: "all",
    label: "All Time",
    fromISO: startDate.toISOString(),
    toISO: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString(),
  };
}

/**
 * Get range options for UI selector
 */
export function getCrmRangeOptions(): Array<{
  key: CrmRangeKey;
  label: string;
}> {
  return [
    { key: "this_month", label: "This Month" },
    { key: "last_7_days", label: "Last 7 Days" },
    { key: "all", label: "All Time" },
  ];
}
