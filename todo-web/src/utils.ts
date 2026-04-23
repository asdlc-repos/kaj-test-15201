/**
 * Returns true if the given YYYY-MM-DD date string is strictly before today (local time).
 * Parses as local noon to avoid UTC/local timezone off-by-one errors.
 */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  // Parse as local noon to avoid timezone issues
  const [year, month, day] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day, 12, 0, 0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return due < today;
}

export function formatDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
