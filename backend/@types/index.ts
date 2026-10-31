import { users } from "../db/schema";
import type { DrizzleQueryError } from "drizzle-orm";
import type postgres from "postgres";

export type User = typeof users.$inferSelect;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type PGWrappedError = DrizzleQueryError & {
  cause: postgres.PostgresError;
};
