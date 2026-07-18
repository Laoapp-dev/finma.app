/** Returns a stable "YYYY-MM" key for grouping transactions into monthly cycles. */
export function monthKey(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Human readable month label, e.g. "June 2026". */
export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Returns the previous month's key relative to the given key. */
export function previousMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1); // m-1 is current month index, -1 more for previous
  return monthKey(d);
}

/** Returns the key `n` months after the given key (n may be negative). */
export function addMonthsToKey(key, n) {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
}
