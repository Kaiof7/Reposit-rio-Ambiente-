import { describe, expect, it } from "vitest";
import { changeModel, customizationSchema, fieldErrors, initialCustomization } from "./customization";

const valid = { ...initialCustomization("avaliacao-google"), businessName: "  Padaria Pão Quente " };

describe("customization schema", () => {
  it("accepts a complete customization and trims the texts", () => {
    const result = customizationSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.businessName).toBe("Padaria Pão Quente");
  });

  it("reports empty and too long texts per field in Portuguese", () => {
    const result = customizationSchema.safeParse({ ...valid, businessName: "   ", callToAction: "x".repeat(31) });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!)).toEqual({
      businessName: "Informe o nome do negócio.",
      callToAction: "Use no máximo 30 caracteres.",
    });
  });

  it("rejects a size the chosen model does not offer", () => {
    const result = customizationSchema.safeParse({ ...valid, modelId: "pix", sizeId: "adesivo-5" });
    expect(fieldErrors(result.error!)).toEqual({ sizeId: "Escolha um tamanho disponível para este modelo." });
  });

  it("rejects unknown models and backgrounds", () => {
    const result = customizationSchema.safeParse({ ...valid, modelId: "nfc-magico", backgroundId: "dourado" });
    expect(Object.keys(fieldErrors(result.error!)).sort()).toEqual(["backgroundId", "modelId"]);
  });
});

describe("changing model", () => {
  it("follows the new model defaults the customer had not changed", () => {
    const next = changeModel(initialCustomization("avaliacao-google"), "pix");
    expect(next).toMatchObject({ modelId: "pix", sizeId: "adesivo-8", backgroundId: "verde", callToAction: "Pague com Pix" });
  });

  it("keeps what the customer chose or typed", () => {
    const edited = { ...valid, sizeId: "display-10x15", backgroundId: "vinho" as const, callToAction: "Deixe 5 estrelas" };
    const next = changeModel(edited, "instagram");
    expect(next).toMatchObject({
      modelId: "instagram",
      sizeId: "display-10x15",
      backgroundId: "vinho",
      callToAction: "Deixe 5 estrelas",
      businessName: valid.businessName,
    });
  });
});
