import {
  endOfDay,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Get user's timezone (falls back to UTC if unavailable)
 */
export function getUserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      console.warn("Could not detect timezone, falling back to UTC");
    }
  }
  return "UTC";
}

/**
 * Convert UTC date to user's timezone
 */
export function toUserTimezone(date: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  return toZonedTime(date, tz);
}

/**
 * Convert user's timezone date to UTC
 */
export function toUTC(date: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  return fromZonedTime(date, tz);
}

/**
 * Get start of day in user's timezone, as UTC
 */
export function getStartOfDayUTC(date: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  const zoned = toZonedTime(date, tz);
  const start = startOfDay(zoned);
  return fromZonedTime(start, tz);
}

/**
 * Get end of day in user's timezone, as UTC
 */
export function getEndOfDayUTC(date: Date, timezone?: string): Date {
  const tz = timezone || getUserTimezone();
  const zoned = toZonedTime(date, tz);
  const end = endOfDay(zoned);
  return fromZonedTime(end, tz);
}

/**
 * Get last N days date range (in UTC, but respecting user timezone boundaries)
 */
export function getLastNDaysRange(
  days: number,
  timezone?: string,
): { start: Date; end: Date } {
  const tz = timezone || getUserTimezone();
  const today = new Date();
  const todayZoned = toZonedTime(today, tz);

  const endZoned = endOfDay(todayZoned);
  const startZoned = startOfDay(subDays(todayZoned, days - 1));

  return {
    start: fromZonedTime(startZoned, tz),
    end: fromZonedTime(endZoned, tz),
  };
}

/**
 * Get last N months date range (in UTC, but respecting user timezone boundaries)
 */
export function getLastNMonthsRange(
  months: number,
  timezone?: string,
): { start: Date; end: Date } {
  const tz = timezone || getUserTimezone();
  const today = new Date();
  const todayZoned = toZonedTime(today, tz);

  const endZoned = endOfDay(todayZoned);
  const startZoned = startOfMonth(subMonths(todayZoned, months - 1));

  return {
    start: fromZonedTime(startZoned, tz),
    end: fromZonedTime(endZoned, tz),
  };
}

/**
 * Quick date range presets
 */
export const DATE_RANGE_PRESETS = {
  last7Days: () => getLastNDaysRange(7),
  last30Days: () => getLastNDaysRange(30),
  last3Months: () => getLastNMonthsRange(3),
} as const;

/**
 * Check if date is within range (inclusive)
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date,
): boolean {
  return date >= startDate && date <= endDate;
}
