import "server-only";
import { adminPasswordSchema, databaseUrlSchema, logLevelSchema, parseEnv } from "./env-schema";

export function getDatabaseUrl() {
  return parseEnv("DATABASE_URL", process.env.DATABASE_URL, databaseUrlSchema);
}

// Without a database the store uses the catalog defaults from code.
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

// Null when unset or too short: the panel stays closed.
export function getAdminPassword() {
  const result = adminPasswordSchema.safeParse(process.env.ADMIN_PASSWORD);
  return result.success ? result.data : null;
}

export function getLogLevel() {
  return parseEnv("LOG_LEVEL", process.env.LOG_LEVEL, logLevelSchema);
}
