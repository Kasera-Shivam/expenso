import { users } from "../db/schema";
import type { DrizzleQueryError } from "drizzle-orm";
import type postgres from "postgres";
import type { ZodType } from "zod";

export type User = typeof users.$inferSelect;

declare global {
  var _postgresClient: ReturnType<typeof postgres> | undefined;
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export type PGWrappedError = DrizzleQueryError & {
  cause: postgres.PostgresError;
};

export type Schemas = {
  query?: ZodType;
  params?: ZodType;
  body?: ZodType;
};
