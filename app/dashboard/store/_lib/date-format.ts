const storeDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export function formatStoreDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = storeDateTimeFormatter.formatToParts(date);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${lookup("day")}-${lookup("month")}-${lookup("year")}, ${lookup("hour")}:${lookup("minute")}:${lookup("second")} ${lookup("dayPeriod").toUpperCase()}`;
}
