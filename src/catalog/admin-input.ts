import { z } from "zod";
import { MODELS, type ModelId } from "./models";

const MAX_PRICE_CENTS = 100_000_00;

// "19,90", "R$ 1.234,56", "19.90" or "19" to integer cents; null if invalid.
export function parsePriceToCents(input: string): number | null {
  let value = input.replace(/R\$|\s/g, "");
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(value)) value = value.replace(/\./g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 && cents <= MAX_PRICE_CENTS ? cents : null;
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(label: string) {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function uniqueId(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  const root = base || "tamanho";
  let id = root;
  for (let n = 2; used.has(id); n++) id = `${root}-${n}`;
  return id;
}

export type ModelForm = {
  modelId: ModelId;
  available: boolean;
  offers: { sizeId: string; priceCents: number; soldOut: boolean }[];
};

// Reads one model's panel form. Field names: "available", "offer:<size>",
// "price:<size>", "soldOut:<size>". Errors are keyed by size id.
export function parseModelForm(form: FormData, sizeIds: readonly string[]) {
  const modelId = MODELS.find((model) => model.id === form.get("modelId"))?.id;
  if (!modelId) return { ok: false as const, errors: { form: "Modelo inválido." } as Record<string, string> };
  const errors: Record<string, string> = {};
  const offers: ModelForm["offers"] = [];
  for (const sizeId of sizeIds) {
    if (form.get(`offer:${sizeId}`) !== "on") continue;
    const priceCents = parsePriceToCents(String(form.get(`price:${sizeId}`) ?? ""));
    if (priceCents === null) errors[sizeId] = "Informe um preço válido, como 19,90.";
    else offers.push({ sizeId, priceCents, soldOut: form.get(`soldOut:${sizeId}`) === "on" });
  }
  if (Object.keys(errors).length > 0) return { ok: false as const, errors };
  return { ok: true as const, value: { modelId, available: form.get("available") === "on", offers } satisfies ModelForm };
}

export const sizeFormSchema = z.object({
  id: z.string(),
  label: z.string().trim().min(2, "Informe o nome do tamanho, como Adesivo 10 × 10 cm.").max(60, "Use no máximo 60 caracteres."),
  description: z.string().trim().max(80, "Use no máximo 80 caracteres."),
  shape: z.enum(["square", "portrait"], "Escolha o formato."),
});

export type SizeForm = z.output<typeof sizeFormSchema>;
