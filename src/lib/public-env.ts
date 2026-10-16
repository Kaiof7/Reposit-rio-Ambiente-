import { parseEnv, whatsappNumberSchema } from "./env-schema";

// NEXT_PUBLIC_* values are inlined at build time, so the variable must be
// read with its literal name. The number is public by design: it is the
// seller's contact shown in the wa.me link.
export function getWhatsAppNumber() {
  return parseEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, whatsappNumberSchema);
}
