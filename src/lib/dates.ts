const DEFAULT_TIME_ZONE = "Asia/Kolkata";

export function formatLedgerDate(
  value: Date | string,
  timeZone = DEFAULT_TIME_ZONE,
  locale = "en-IN",
) {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid ledger date");
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(date);
}
