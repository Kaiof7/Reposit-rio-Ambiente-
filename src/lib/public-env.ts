import { parseEnv, whatsappNumberSchema } from "./env-schema";

// NEXT_PUBLIC_* values are inlined at build time, so the variable must be
// read with its literal name. The number is public by design: it is the
// seller's contact shown in the wa.me link.
export function getWhatsAppNumber() {
  return parseEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, whatsappNumberSchema);
}

// Seller number, versioned at the seller's request (2026-10-17).
// NEXT_PUBLIC_WHATSAPP_NUMBER overrides it when set and valid.
export const DEFAULT_WHATSAPP_NUMBER = "5583991153515";

// Next inlines NEXT_PUBLIC_* at build time, also on the server: a value set
// during `next build` is fixed until the next build. Without a build-time
// value, it is read at runtime. Missing or invalid: the default number.
export function findWhatsAppNumber() {
  try {
    return getWhatsAppNumber();
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}
