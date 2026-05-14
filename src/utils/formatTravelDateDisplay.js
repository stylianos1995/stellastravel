/**
 * Display travel / return dates as DD/MM/YY.
 * Accepts YYYY-MM-DD from `<input type="date" />` and the API; other non-empty strings are returned unchanged.
 */
export function formatTravelDateDisplay(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  const [, y, mo, d] = m;
  return `${d}/${mo}/${String(y).slice(-2)}`;
}
