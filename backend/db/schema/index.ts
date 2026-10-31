import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  decimal,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import utils from "../../lib/utils";

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "card",
  "other",
]);

export const users = pgTable("users", {
  id: varchar("id", { length: 11 })
    .primaryKey()
    .$defaultFn(() => utils.GenerateRandomStr()),
  firstName: varchar("first_name", { length: 64 }).notNull(),
  lastName: varchar("last_name"),
  name: varchar("name", { length: 129 })
    .notNull()
    .generatedAlwaysAs(
      () => sql`TRIM(first_name || ' ' || COALESCE(last_name, ''))`,
    ),
  avatar: text("avatar"),
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { precision: 3, withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: varchar("id", { length: 11 })
      .primaryKey()
      .$defaultFn(() => utils.GenerateRandomStr()),
    familyId: varchar("family_id", { length: 11 })
      .notNull()
      .$defaultFn(() => utils.GenerateRandomStr()),
    token: varchar("token", { length: 64 }).notNull().unique(),
    isRevoked: boolean("is_revoked").notNull().default(false),
    userId: varchar("user_id", { length: 11 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_refresh_tokens_family_id").on(table.familyId),
    index("idx_refresh_tokens_user_id").on(table.userId),
    index("idx_refresh_tokens_expires_at").on(table.expiresAt),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: varchar("id", { length: 11 })
      .primaryKey()
      .$defaultFn(() => utils.GenerateRandomStr()),
    name: varchar("name", { length: 64 }).notNull(),
    color: varchar("color", { length: 7 }).notNull(),
    userId: varchar("user_id", { length: 11 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_categories_user_name").on(table.name, table.userId),
    index("idx_categories_user_id").on(table.userId),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: varchar("id", { length: 11 })
      .primaryKey()
      .$defaultFn(() => utils.GenerateRandomStr()),
    title: varchar("title", { length: 128 }).notNull(),
    amount: decimal({ mode: "string", precision: 10, scale: 2 }).notNull(),
    note: text("note"),
    categoryId: varchar("category_id", { length: 11 }).references(
      () => categories.id,
      { onDelete: "set null" },
    ),
    paymentMethod: paymentMethodEnum().notNull().default("upi"),
    date: date().notNull(),
    userId: varchar("user_id", { length: 11 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_expenses_user_date").on(table.userId, table.date),
    index("idx_expenses_user_category").on(table.userId, table.categoryId),
    check("chk_expenses_amount_positive", sql`${table.amount} > 0`),
  ],
);
