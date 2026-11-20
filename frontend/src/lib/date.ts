const pad = (n: number) => String(n).padStart(2, "0");

export const RANGES = {
  "7d": 7,
  "1m": 31,
  "3m": 90,
} as const;

export const toDateString = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => toDateString(new Date());

export const getRange = (key: RangeKey) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (RANGES[key] - 1));
  return { from: toDateString(from), to: toDateString(to) };
};

export type RangeKey = keyof typeof RANGES;

export const monthKey = (d = new Date()) => toDateString(d).slice(0, 7);

// "T00:00:00" keeps the date in local time, so it never shifts by a day
export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const timeAgo = (iso: string) => {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size)
      return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
