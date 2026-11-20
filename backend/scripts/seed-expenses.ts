import { and, eq } from "drizzle-orm";
import db from "../db";
import { categories, expenses, users } from "../db/schema";

const SEED_NOTE = "seed-data";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: bun run scripts/seed-expenses.ts <email>");
  process.exit(1);
}

type Method = "cash" | "upi" | "card" | "other";
// [category (null = uncategorized), title, amount, method, daysAgo]
const rows: [string | null, string, string, Method, number][] = [
  // Food
  ["Food", "Swiggy dinner", "450.50", "upi", 0],
  ["Food", "Chai", "20.00", "cash", 0],
  ["Food", "Zomato lunch", "320.00", "upi", 2],
  ["Food", "Groceries", "1850.75", "upi", 4],
  ["Food", "Cafe coffee", "180.00", "card", 6],
  ["Food", "Biryani", "520.00", "upi", 9],
  ["Food", "Pizza", "699.00", "card", 13],
  ["Food", "Vegetables", "240.00", "cash", 16],
  ["Food", "Dominos", "549.00", "upi", 21],
  ["Food", "Groceries", "2200.00", "upi", 28],
  ["Food", "Restaurant dinner", "1450.00", "card", 35],
  ["Food", "Swiggy", "380.00", "upi", 44],
  ["Food", "Groceries", "1990.50", "upi", 58],
  ["Food", "Street food", "90.00", "cash", 63],
  ["Food", "Birthday cake", "850.00", "cash", 72],
  ["Food", "Zomato", "410.00", "upi", 80],
  // Travel
  ["Travel", "Uber to office", "180.00", "card", 1],
  ["Travel", "Metro recharge", "500.00", "upi", 5],
  ["Travel", "Petrol", "1200.00", "cash", 8],
  ["Travel", "Auto", "70.00", "cash", 12],
  ["Travel", "Train ticket", "840.00", "upi", 20],
  ["Travel", "Uber airport", "650.00", "card", 27],
  ["Travel", "Bus ticket", "150.00", "cash", 40],
  ["Travel", "Flight", "6200.00", "card", 50],
  ["Travel", "Cab", "230.00", "upi", 66],
  // Rent
  ["Rent", "Room rent", "8000.00", "upi", 30],
  ["Rent", "Room rent", "8000.00", "upi", 60],
  // Bills
  ["Bills", "Electricity bill", "1250.75", "upi", 3],
  ["Bills", "Internet", "799.00", "upi", 11],
  ["Bills", "Mobile recharge", "299.00", "upi", 18],
  ["Bills", "Electricity bill", "1180.00", "upi", 33],
  ["Bills", "Internet", "799.00", "upi", 41],
  ["Bills", "Water bill", "220.00", "cash", 55],
  ["Bills", "Electricity bill", "1420.25", "upi", 64],
  ["Bills", "Internet", "799.00", "upi", 71],
  // Shopping
  ["Shopping", "Shoes", "2499.00", "card", 7],
  ["Shopping", "T-shirt", "799.00", "upi", 15],
  ["Shopping", "Headphones", "1999.00", "card", 25],
  ["Shopping", "Books", "450.00", "upi", 38],
  ["Shopping", "Jacket", "3200.00", "card", 47],
  ["Shopping", "Amazon order", "640.00", "upi", 76],
  // Health
  ["Health", "Medicines", "320.00", "cash", 10],
  ["Health", "Doctor visit", "500.00", "cash", 24],
  ["Health", "Gym", "1500.00", "upi", 31],
  ["Health", "Gym", "1500.00", "upi", 61],
  ["Health", "Dentist", "1200.00", "card", 52],
  // Other
  ["Other", "Gift", "1000.00", "cash", 17],
  ["Other", "Haircut", "250.00", "cash", 22],
  ["Other", "Donation", "101.00", "cash", 34],
  // Uncategorized (category null)
  [null, "Misc", "75.00", "cash", 14],
];

const dateDaysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const [user] = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
if (!user) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}

const userCategories = await db
  .select({ id: categories.id, name: categories.name })
  .from(categories)
  .where(eq(categories.userId, user.id));
const categoryId = new Map(userCategories.map((c) => [c.name, c.id]));

// pehle ki seed rows hatao, taaki script baar-baar chalane par duplicate na bane
await db
  .delete(expenses)
  .where(and(eq(expenses.userId, user.id), eq(expenses.note, SEED_NOTE)));

await db.insert(expenses).values(
  rows.map(([category, title, amount, paymentMethod, daysAgo]) => ({
    userId: user.id,
    categoryId: category ? (categoryId.get(category) ?? null) : null,
    title,
    amount,
    paymentMethod,
    date: dateDaysAgo(daysAgo),
    note: SEED_NOTE,
  })),
);

console.log(`Seeded ${rows.length} expenses for ${email}`);
process.exit(0);
