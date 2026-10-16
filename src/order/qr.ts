import { z } from "zod";
import { normalizeNfcUrl } from "@/order/nfc";
import { PIX_CITY_MAX, PIX_KEY_TYPES, PIX_NAME_MAX, buildPixPayload, normalizePixKey, type PixKeyType } from "@/order/pix";

const keyTypes = Object.keys(PIX_KEY_TYPES) as [PixKeyType, ...PixKeyType[]];

const KEY_ERRORS: Record<PixKeyType, string> = {
  cpf: "CPF inválido. Confira os números.",
  cnpj: "CNPJ inválido. Confira os números.",
  celular: "Celular inválido. Use DDD e número, como (11) 91234-5678.",
  email: "E-mail inválido.",
  aleatoria: "Chave aleatória inválida. Copie a chave completa do app do banco.",
};

export const qrSchema = z
  .object({
    mode: z.enum(["nenhum", "pix", "link"]),
    pix: z.object({ keyType: z.enum(keyTypes), key: z.string(), name: z.string(), city: z.string() }),
    // "chip": same destination as the NFC chip; "outro": its own link.
    link: z.object({ source: z.enum(["chip", "outro"]), url: z.string(), needsCreation: z.boolean() }),
  })
  .transform((value, ctx) => {
    const fail = (path: string[], message: string) => {
      ctx.addIssue({ code: "custom", path, message });
      return z.NEVER;
    };

    if (value.mode === "nenhum") return { mode: "nenhum" as const };

    if (value.mode === "link") {
      if (value.link.source === "chip") return { mode: "link" as const, source: "chip" as const };
      if (value.link.needsCreation) return { mode: "link" as const, source: "outro" as const, url: null, creation: "site" as const };
      if (!value.link.url.trim()) return fail(["link", "url"], "Informe o link do QR code.");
      const url = normalizeNfcUrl(value.link.url, "outro");
      if (!url) return fail(["link", "url"], "Esse link não parece válido. Confira se copiou o endereço completo.");
      return { mode: "link" as const, source: "outro" as const, url, creation: undefined };
    }

    const { keyType } = value.pix;
    const name = value.pix.name.trim();
    const city = value.pix.city.trim();
    const key = value.pix.key.trim() ? normalizePixKey(keyType, value.pix.key) : null;
    if (!value.pix.key.trim()) fail(["pix", "key"], "Informe a chave Pix.");
    else if (!key) fail(["pix", "key"], KEY_ERRORS[keyType]);
    if (!name) fail(["pix", "name"], "Informe o nome de quem recebe.");
    else if (name.length > PIX_NAME_MAX) fail(["pix", "name"], `Use no máximo ${PIX_NAME_MAX} caracteres.`);
    if (!city) fail(["pix", "city"], "Informe a cidade de quem recebe.");
    else if (city.length > PIX_CITY_MAX) fail(["pix", "city"], `Use no máximo ${PIX_CITY_MAX} caracteres.`);
    if (!key || !name || !city || name.length > PIX_NAME_MAX || city.length > PIX_CITY_MAX) return z.NEVER;
    return { mode: "pix" as const, keyType, key, name, city, payload: buildPixPayload({ key, name, city }) };
  });

export type QrInput = z.input<typeof qrSchema>;
export type QrContent = z.output<typeof qrSchema>;

export const initialQr: QrInput = {
  mode: "nenhum",
  pix: { keyType: "celular", key: "", name: "", city: "" },
  link: { source: "chip", url: "", needsCreation: false },
};

// Errors keyed by dotted path ("pix.key", "link.url").
export function qrErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[issue.path.join(".")] ??= issue.message;
  return errors;
}
