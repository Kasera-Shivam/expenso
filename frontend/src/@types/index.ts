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
