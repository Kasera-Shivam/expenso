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
