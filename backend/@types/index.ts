import { users } from "../db/schema";

export type User = typeof users.$inferSelect;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
