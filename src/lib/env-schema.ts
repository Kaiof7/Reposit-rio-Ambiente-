import { z } from "zod";

export const databaseUrlSchema = z.string().refine((value) => {
  try {
    const url = new URL(value);
    return ["postgres:", "postgresql:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
});

// Single seller password for /painel; long enough to resist guessing.
export const adminPasswordSchema = z.string().min(12);

export const logLevelSchema = z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info");

// Brazilian WhatsApp number in the digits-only format wa.me expects:
// country code 55 + DDD (2 digits) + 8 or 9 digit subscriber number.
export const whatsappNumberSchema = z.string().regex(/^55\d{10,11}$/);

export function parseEnv<T>(key: string, value: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(value);
  // Zod issues can include input values; expose only the variable name.
  if (!result.success) throw new Error(`Invalid or missing environment variable: ${key}`);
  return result.data;
}
