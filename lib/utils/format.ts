import { format, parseISO } from "date-fns";

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatTimeWithOffset(date: Date | string): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  // Add the timezone offset back to display in local time
  const localDate = new Date(
    parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000
  );
  return format(localDate, "hh:mm a");
}
