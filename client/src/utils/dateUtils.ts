/**
 * Date utility functions to prevent timezone-related date shifts.
 *
 * Problem: new Date("2025-06-13") is parsed as UTC midnight.
 * In US timezones (UTC-5 etc.), this displays as June 12.
 *
 * Solution: Append "T00:00:00" (no "Z") so JS interprets it as local midnight,
 * which always displays the correct calendar date regardless of timezone.
 */

/**
 * Parse a date string as local time (no UTC shift).
 * Handles both "2025-06-13" and "2025-06-13T00:00:00.000Z" formats.
 */
export function parseLocalDate(dateString: string): Date {
  const datePart = dateString.split('T')[0];
  return new Date(datePart + 'T00:00:00');
}

/**
 * Format a date string for display without timezone shift.
 * Pass kst: true to append "(KST)" for public-facing pages.
 */
export function formatLocalDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions & { kst?: boolean }
): string {
  const { kst, ...dateOptions } = options || {};
  const date = parseLocalDate(dateString);
  const formatted = date.toLocaleDateString('en-US', Object.keys(dateOptions).length > 0 ? dateOptions : {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return kst ? `${formatted} (KST)` : formatted;
}

/**
 * Get the year from a date string without timezone shift.
 */
export function getLocalYear(dateString: string): number {
  return parseLocalDate(dateString).getFullYear();
}

/**
 * datetime-local input handling — KST timezone-anchored.
 *
 * The conference is in Seoul. All deadline times in the system are KST. Browser
 * `<input type="datetime-local">` is timezone-naive ("YYYY-MM-DDTHH:MM"); we
 * anchor those values to KST (+09:00) on submit and convert UTC values from the
 * server back to KST for display in the input.
 *
 * Without this anchoring, an admin in any other timezone would silently set the
 * deadline to their local hour, not KST.
 */
const KST_OFFSET = '+09:00';

/**
 * Convert a datetime-local input value (assumed KST) to UTC ISO. Send to API.
 * "2026-12-12T23:59" (KST) -> "2026-12-12T14:59:00.000Z"
 */
export function kstDateTimeInputToUtcIso(input: string): string | null {
  if (!input) return null;
  const hasSeconds = /T\d{2}:\d{2}:\d{2}$/.test(input);
  const withSeconds = hasSeconds ? input : `${input}:00`;
  const date = new Date(`${withSeconds}${KST_OFFSET}`);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

/**
 * Convert a UTC ISO string from the server to a datetime-local input value (KST).
 * "2026-12-12T14:59:00.000Z" -> "2026-12-12T23:59"
 */
export function utcIsoToKstDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // Shift to KST by adding the offset, then read UTC components.
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth() + 1)}-${pad(kst.getUTCDate())}T${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())}`;
}

/**
 * Format a UTC ISO timestamp as a calendar date in KST. Use this when only the
 * date matters but the value is a TIMESTAMP — `formatLocalDate` strips the time
 * portion before timezone-converting, which can shift the KST calendar day.
 * "2026-12-12T23:59:00.000Z" -> "December 13, 2026 (KST)"
 */
export function formatKstDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const formatted = d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `${formatted} (KST)`;
}

/**
 * Format a UTC ISO string for human display in KST. Always includes "(KST)".
 * "2026-12-12T14:59:00.000Z" -> "Dec 12, 2026, 11:59 PM (KST)"
 */
export function formatKstDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const formatted = d.toLocaleString('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${formatted} (KST)`;
}
