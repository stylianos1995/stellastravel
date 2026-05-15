const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Pending admin inbox items older than one week (unchecked only). */
export function isAdminRequestOverdue(item) {
  if (!item || item.is_checked) return false;
  const created = new Date(item.created_at);
  if (Number.isNaN(created.getTime())) return false;
  return Date.now() - created.getTime() > MS_PER_WEEK;
}
