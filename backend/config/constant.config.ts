const REFRESH_TOKEN_PATH = "/api/account";
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#f97316" },
  { name: "Travel", color: "#3b82f6" },
  { name: "Rent", color: "#8b5cf6" },
  { name: "Shopping", color: "#ec4899" },
  { name: "Bills", color: "#eab308" },
  { name: "Health", color: "#22c55e" },
  { name: "Other", color: "#6b7280" },
];

const constant = { REFRESH_TOKEN_PATH, REFRESH_TTL_MS, DEFAULT_CATEGORIES };

export default constant;
