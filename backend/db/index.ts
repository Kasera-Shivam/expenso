import env from "../config/env.config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  var _postgresClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis._postgresClient ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") globalThis._postgresClient = client;

const db = drizzle(client, { schema });

export default db;
