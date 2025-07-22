// Date utility functions

/**
 * Get the start of day in UTC
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of day in UTC
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateToString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 */
export function parseDateString(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }
  return date;
}

/**
 * Get dates for the past N days
 */
export function getPastDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDateToString(date));
  }
  
  return dates.reverse();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getUTCFullYear() === today.getUTCFullYear() &&
    d.getUTCMonth() === today.getUTCMonth() &&
    d.getUTCDate() === today.getUTCDate()
  );
}