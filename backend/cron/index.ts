import cron from "node-cron";
import { and, eq, lt, or } from "drizzle-orm";
import db from "../db";
import { refreshTokens } from "../db/schema";

export const cleanupTokens = async () => {
  await db
    .delete(refreshTokens)
    .where(
      or(
        lt(refreshTokens.expiresAt, new Date()),
        and(
          eq(refreshTokens.isRevoked, true),
          lt(
            refreshTokens.updatedAt,
            new Date(Date.now() - 24 * 60 * 60 * 1000),
          ),
        ),
      ),
    );
};

export const startCleanupJob = () => {
  cleanupTokens().catch(console.error);
  cron.schedule("0 * * * *", () => {
    cleanupTokens().catch(console.error);
  });
};
