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

export type OrderEmailConfig = { apiKey: string; from: string; to: string };

// Order copies by e-mail (Resend). Null without RESEND_API_KEY or a recipient:
// orders keep going only through WhatsApp. ORDER_EMAIL_TO defaults to ADMIN_EMAIL.
export function getOrderEmailConfig(): OrderEmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = adminEmailSchema.safeParse(process.env.ORDER_EMAIL_TO || process.env.ADMIN_EMAIL);
  if (!apiKey || !to.success) return null;
  const from = process.env.ORDER_EMAIL_FROM?.trim() || "Sua Plaquinha NFC <onboarding@resend.dev>";
  return { apiKey, from, to: to.data };
}

export function getLogLevel() {
  return parseEnv("LOG_LEVEL", process.env.LOG_LEVEL, logLevelSchema);
}
