import {
  ReceiptTextIcon,
  SettingsIcon,
  TagsIcon,
  PiggyBankIcon,
} from "lucide-react";

export const NAV = [
  { to: "/", label: "Expenses", icon: ReceiptTextIcon },
  { to: "/categories", label: "Categories", icon: TagsIcon },
  { to: "/budget", label: "Budget", icon: PiggyBankIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export const LINKS = [
  { to: "/chart", label: "Charts" },
  { to: "/categories", label: "Categories" },
  { to: "/budget", label: "Budget" },
  { to: "/settings", label: "Settings" },
];
