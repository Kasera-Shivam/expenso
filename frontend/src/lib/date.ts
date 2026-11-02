const pad = (n: number) => String(n).padStart(2, "0");

export const toDateString = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => toDateString(new Date());
