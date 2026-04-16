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
