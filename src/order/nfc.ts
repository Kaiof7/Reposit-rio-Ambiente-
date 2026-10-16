import { z } from "zod";
import type { ModelId } from "@/catalog/models";

export const NFC_DESTINATIONS = {
  "avaliacao-google": { label: "Avaliação no Google", placeholder: "https://g.page/r/..." },
  site: { label: "Site", placeholder: "https://seunegocio.com.br" },
  instagram: { label: "Instagram", placeholder: "@seuperfil ou link do perfil" },
  cardapio: { label: "Cardápio digital", placeholder: "https://..." },
  outro: { label: "Outro link", placeholder: "https://..." },
} as const;

export type NfcDestination = keyof typeof NFC_DESTINATIONS;

const DEFAULT_DESTINATION: Record<ModelId, NfcDestination> = {
  "avaliacao-google": "avaliacao-google",
  pix: "outro",
  "link-site": "site",
  instagram: "instagram",
  cardapio: "cardapio",
};

export function defaultDestinationFor(modelId: ModelId) {
  return DEFAULT_DESTINATION[modelId];
}

const INSTAGRAM_HANDLE = /^@?([A-Za-z0-9._]{1,30})$/;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

// Customers paste links in many shapes: accept a bare domain or an Instagram
// @handle and turn it into the http(s) URL that will be written to the chip.
// Returns null when the result is not a usable web address.
export function normalizeNfcUrl(input: string, destination: NfcDestination): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;

  const handle = destination === "instagram" && (value.startsWith("@") || !value.includes(".")) && INSTAGRAM_HANDLE.exec(value);
  if (handle) return `https://www.instagram.com/${handle[1]}/`;

  let url: URL;
  try {
    url = new URL(HAS_SCHEME.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const isWeb = url.protocol === "https:" || url.protocol === "http:";
  const hasDomain = /^[^.]+(\.[^.]+)+$/.test(url.hostname);
  return isWeb && hasDomain ? url.href : null;
}

const destinationIds = Object.keys(NFC_DESTINATIONS) as [NfcDestination, ...NfcDestination[]];

export const nfcSchema = z
  .object({
    destination: z.enum(destinationIds, "Escolha para onde o chip vai levar."),
    url: z.string(),
  })
  .transform((value, ctx) => {
    if (!value.url.trim()) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Informe o link que será gravado no chip." });
      return z.NEVER;
    }
    const url = normalizeNfcUrl(value.url, value.destination);
    if (!url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Esse link não parece válido. Confira se copiou o endereço completo.",
      });
      return z.NEVER;
    }
    return { destination: value.destination, url };
  });

export type NfcInput = z.input<typeof nfcSchema>;
export type NfcField = keyof NfcInput;
