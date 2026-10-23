import { describe, expect, it } from "vitest";
import { centsToInput, parseModelForm, parsePriceToCents, sizeFormSchema, slugify, uniqueId } from "./admin-input";

describe("parsePriceToCents", () => {
  it("reads Brazilian and plain formats", () => {
    expect(parsePriceToCents("19,90")).toBe(1990);
    expect(parsePriceToCents("R$ 1.234,56")).toBe(123456);
    expect(parsePriceToCents("19.90")).toBe(1990);
    expect(parsePriceToCents("19,9")).toBe(1990);
    expect(parsePriceToCents("20")).toBe(2000);
    expect(parsePriceToCents("1.500")).toBe(150000);
  });

  it("rejects empty, zero, negative and malformed prices", () => {
    for (const value of ["", "0", "0,00", "-5", "abc", "19,999", "1,2,3"]) expect(parsePriceToCents(value)).toBeNull();
  });

  it("round-trips the input format", () => {
    expect(centsToInput(1990)).toBe("19,90");
    expect(parsePriceToCents(centsToInput(123456))).toBe(123456);
  });
});

it("turns size names into unique ids", () => {
  expect(slugify("Adesivo 10 × 10 cm")).toBe("adesivo-10-x-10-cm");
  expect(slugify("Acrílico Médio")).toBe("acrilico-medio");
  expect(uniqueId("adesivo-8", ["adesivo-8", "adesivo-8-2"])).toBe("adesivo-8-3");
  expect(uniqueId("", [])).toBe("tamanho");
});

describe("parseModelForm", () => {
  const form = (entries: Record<string, string>) => {
    const data = new FormData();
    for (const [key, value] of Object.entries(entries)) data.set(key, value);
    return data;
  };

  it("keeps only offered sizes with their price and sold-out flag", () => {
    const result = parseModelForm(
      form({ modelId: "pix", available: "on", "offer:a": "on", "price:a": "29,90", "soldOut:a": "on", "price:b": "10" }),
      ["a", "b"],
    );
    expect(result).toEqual({
      ok: true,
      value: { modelId: "pix", available: true, sizeIds: ["a", "b"], offers: [{ sizeId: "a", priceCents: 2990, soldOut: true }] },
    });
  });

  it("reports bad prices per size and unknown models", () => {
    expect(parseModelForm(form({ modelId: "pix", "offer:a": "on", "price:a": "" }), ["a"])).toEqual({
      ok: false,
      errors: { a: "Informe um preço válido, como 19,90." },
    });
    expect(parseModelForm(form({ modelId: "nao-existe" }), [])).toMatchObject({ ok: false, errors: { form: "Modelo inválido." } });
  });
});

it("validates the size form", () => {
  expect(sizeFormSchema.safeParse({ id: "", label: " Adesivo 10 × 10 cm ", description: "", shape: "square" }).data?.label).toBe(
    "Adesivo 10 × 10 cm",
  );
  expect(sizeFormSchema.safeParse({ id: "", label: "A", description: "", shape: "round" }).success).toBe(false);
});
