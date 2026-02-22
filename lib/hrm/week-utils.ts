/**
 * HRM Week Utilities - Timezone and Week Management
 * All dates are based on Asia/Dhaka timezone
 * Week key format: YYYY-MM-DD (the Friday date)
 */

/**
 * Get current date/time in Asia/Dhaka timezone
 */
export function getDhakaNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
}

/**
 * Get the Friday date for a given date
 * If date is already Friday, return it
 * Otherwise, return the upcoming Friday
 */
export function getFridayDateForWeek(date: Date): Date {
  const dhaka = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
  const day = dhaka.getDay(); // 0 = Sunday, 5 = Friday
  const daysUntilFriday = day <= 5 ? 5 - day : 7 - day + 5;

  const friday = new Date(dhaka);
  friday.setDate(friday.getDate() + daysUntilFriday);
  friday.setHours(0, 0, 0, 0);

  return friday;
}

/**
 * Get the previous Friday (or current if today is Friday before cutoff)
 * Used for determining "current week" for marking
 */
export function getCurrentFridayDate(): Date {
  const now = getDhakaNow();
  const day = now.getDay();

  // If it's Friday and before 23:59, return today as Friday
  if (day === 5) {
    const friday = new Date(now);
    friday.setHours(0, 0, 0, 0);
    return friday;
  }

  // If Saturday (6) through Thursday (4), get the most recent Friday
  const daysBack = day === 6 ? 1 : day === 0 ? 2 : 7 - (5 - day);
  const friday = new Date(now);
  friday.setDate(friday.getDate() - daysBack);
  friday.setHours(0, 0, 0, 0);

  return friday;
}

/**
 * Convert Friday date to week key string (YYYY-MM-DD)
 */
export function getWeekKeyFromFridayDate(fridayDate: Date): string {
  const year = fridayDate.getFullYear();
  const month = String(fridayDate.getMonth() + 1).padStart(2, "0");
  const day = String(fridayDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse week key to Friday date
 */
export function parseFridayDateFromWeekKey(weekKey: string): Date {
  return new Date(weekKey + "T00:00:00");
}

/**
 * Check if a week is locked (past Friday 23:59 Dhaka time)
 */
export function isWeekLocked(fridayDate: Date | string): boolean {
  const friday =
    typeof fridayDate === "string"
      ? parseFridayDateFromWeekKey(fridayDate)
      : fridayDate;

  const now = getDhakaNow();

  // Set cutoff to Friday 23:59:59 Dhaka time
  const cutoff = new Date(friday);
  cutoff.setHours(23, 59, 59, 999);

  return now > cutoff;
}

/**
 * Check if submission can be edited for a week
 */
export function canEditSubmission(weekKey: string): boolean {
  return !isWeekLocked(weekKey);
}

/**
 * Get week key for current week
 */
export function getCurrentWeekKey(): string {
  const friday = getCurrentFridayDate();
  return getWeekKeyFromFridayDate(friday);
}

/**
 * Format date for display
 */
export function formatWeekDisplay(weekKey: string): string {
  const date = parseFridayDateFromWeekKey(weekKey);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// =========================================
// MONTH UTILITIES (Phase 4)
// =========================================

/**
 * Get month key (YYYY-MM) from date in Dhaka timezone
 */
export function getMonthKeyFromDate(date: Date): string {
  const dhaka = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
  );
  const year = dhaka.getFullYear();
  const month = String(dhaka.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get current month key in Dhaka timezone
 */
export function getCurrentMonthKey(): string {
  return getMonthKeyFromDate(getDhakaNow());
}

/**
 * Parse month key to get start and end dates (Dhaka timezone)
 */
export function getMonthDateRange(monthKey: string): {
  startDate: Date;
  endDate: Date;
} {
  const [year, month] = monthKey.split("-").map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  return { startDate, endDate };
}

/**
 * List all Friday dates in a given month (YYYY-MM)
 * Returns array of week keys (YYYY-MM-DD)
 */
export function listFridayWeekKeysForMonth(monthKey: string): string[] {
  const { startDate, endDate } = getMonthDateRange(monthKey);
  const fridays: string[] = [];

  // Start from first day of month, find all Fridays
  const current = new Date(startDate);

  while (current <= endDate) {
    if (current.getDay() === 5) {
      // Friday
      fridays.push(getWeekKeyFromFridayDate(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return fridays;
}

/**
 * Get expected number of Fridays in a month
 */
export function getExpectedFridaysCount(monthKey: string): number {
  return listFridayWeekKeysForMonth(monthKey).length;
}

/**
 * Format month for display
 */
export function formatMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

/**
 * Get week number within a month (1-based)
 * Returns "Week-1", "Week-2", etc.
 */
export function getWeekNumberInMonth(weekKey: string): string {
  const friday = parseFridayDateFromWeekKey(weekKey);
  const monthKey = getMonthKeyFromDate(friday);
  const fridaysInMonth = listFridayWeekKeysForMonth(monthKey);
  const weekIndex = fridaysInMonth.indexOf(weekKey);

  if (weekIndex === -1) return weekKey; // Fallback

  return `Week-${weekIndex + 1}`;
}

/**
 * Format week with number: "Week-1 (Jan 5, 2026)"
 */
export function formatWeekWithNumber(weekKey: string): string {
  const weekNum = getWeekNumberInMonth(weekKey);
  const date = parseFridayDateFromWeekKey(weekKey);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${weekNum} (${dateStr})`;
}

/**
 * Get month key from week key
 */
export function getMonthKeyFromWeekKey(weekKey: string): string {
  const friday = parseFridayDateFromWeekKey(weekKey);
  return getMonthKeyFromDate(friday);
}

/**
 * Generate month options for select dropdown
 * Returns last 12 months from current month
 */
export function getMonthOptions(count: number = 12): Array<{
  value: string;
  label: string;
}> {
  const options: Array<{ value: string; label: string }> = [];
  const now = getDhakaNow();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthKey = getMonthKeyFromDate(date);
    const label = formatMonthDisplay(monthKey);
    options.push({ value: monthKey, label });
  }

  return options;
}
