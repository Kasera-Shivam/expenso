export type User = {
  email: string;
  id: string;
  name: string;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  userId: string;
  color: string;
  createdAt: Date;
};

export type Expense = {
  title: string;
  amount: string;
  date: string;
  note: string | null;
  categoryId: string | null;
  paymentMethod: "cash" | "upi" | "card" | "other";
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type ExpenseListItem = {
  id: string;
  title: string;
  amount: string;
  note: string | null;
  date: string;
  paymentMethod: "cash" | "upi" | "card" | "other";
  createdAt: string;
  updatedAt: string;
  category: Pick<Category, "id" | "name" | "color"> | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export interface ExpenseSummaryResponse {
  from: string;
  to: string;
  days: number;
  total: string;
  count: number;
  previousTotal: string;
  topCategory: {
    name: string;
    color: string;
    total: string;
  } | null;
}

export type DateRange = { from: string; to: string };

export type ExpenseTrendResponse = {
  from: string;
  to: string;
  unit: "day" | "week";
  categoryId: string | null;
  items: { date: string; total: string }[];
};

export type CategoryBreakdownResponse = {
  from: string;
  to: string;
  items: {
    categoryId: string | null;
    name: string;
    color: string;
    total: string;
    count: number;
  }[];
};
