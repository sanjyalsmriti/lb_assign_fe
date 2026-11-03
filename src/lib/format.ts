const TIME_ZONE = "Asia/Kathmandu";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return dateTimeFormat.format(new Date(value));
}

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

// value for <input type="datetime-local"> in Nepal time
export function toLocalInputValue(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + 345 * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function fromLocalInputValue(value: string) {
  return new Date(`${value}:00+05:45`).toISOString();
}
