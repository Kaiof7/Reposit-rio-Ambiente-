import "server-only";
import { adminEmailSchema, adminPasswordSchema, databaseUrlSchema, logLevelSchema, parseEnv } from "./env-schema";

export function getDatabaseUrl() {
  return parseEnv("DATABASE_URL", process.env.DATABASE_URL, databaseUrlSchema);
}

// Without a database the store uses the catalog defaults from code.
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export type AdminCredentials = { email: string; password: string };

// Null unless ADMIN_EMAIL is a valid e-mail and ADMIN_PASSWORD has 12+
// characters: the panel stays closed.
export function getAdminCredentials(): AdminCredentials | null {
  const email = adminEmailSchema.safeParse(process.env.ADMIN_EMAIL);
  const password = adminPasswordSchema.safeParse(process.env.ADMIN_PASSWORD);
  return email.success && password.success ? { email: email.data, password: password.data } : null;
}

export function getLogLevel() {
  return parseEnv("LOG_LEVEL", process.env.LOG_LEVEL, logLevelSchema);
}
