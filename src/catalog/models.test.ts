import { describe, expect, it } from "vitest";
import { BACKGROUNDS, DEFAULT_CATALOG, DEFAULT_SIZES, MODELS, availableModels, findModel, startingPriceCents, type CatalogModel } from "./models";

describe("catalog", () => {
  it("covers the storefront models with unique URL-safe ids", () => {
    const ids = MODELS.map((model) => model.id);
    expect(ids).toEqual(["avaliacao-google", "pix", "link-site", "instagram", "cardapio"]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("offers known sizes once each with positive integer prices", () => {
    for (const model of MODELS) {
      expect(model.sizes.length).toBeGreaterThan(0);
      const sizeIds = model.sizes.map((size) => size.id);
      expect(new Set(sizeIds).size).toBe(sizeIds.length);
      for (const size of model.sizes) {
        expect(DEFAULT_SIZES).toHaveProperty(size.id);
        expect(Number.isInteger(size.priceCents)).toBe(true);
        expect(size.priceCents).toBeGreaterThan(0);
      }
    }
  });

  it("gives each model a known default background", () => {
    for (const model of MODELS) expect(BACKGROUNDS).toHaveProperty(model.defaultBackgroundId);
  });

  it("finds models by id and ignores unknown ids", () => {
    expect(findModel(DEFAULT_CATALOG, "pix")?.name).toBe("Pix");
    expect(findModel(DEFAULT_CATALOG, "nao-existe")).toBeUndefined();
    expect(findModel(DEFAULT_CATALOG, undefined)).toBeUndefined();
  });

  it("uses the cheapest size still in stock as the starting price", () => {
    const model: CatalogModel = { ...DEFAULT_CATALOG.models[0], sizes: [
      { id: "display-10x15", priceCents: 5990, soldOut: false },
      { id: "adesivo-5", priceCents: 1990, soldOut: true },
    ] };
    expect(startingPriceCents(model)).toBe(5990);
    expect(startingPriceCents({ ...model, sizes: model.sizes.map((size) => ({ ...size, soldOut: true })) })).toBeNull();
  });

  it("lists only available models", () => {
    const catalog = { ...DEFAULT_CATALOG, models: DEFAULT_CATALOG.models.map((model) => ({ ...model, available: model.id !== "pix" })) };
    expect(availableModels(catalog).map((model) => model.id)).not.toContain("pix");
    expect(DEFAULT_CATALOG.pricesAreExamples).toBe(true);
  });
});
