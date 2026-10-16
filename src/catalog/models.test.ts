import { describe, expect, it } from "vitest";
import { BACKGROUNDS, MODELS, SIZES, findModel, startingPriceCents } from "./models";

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
        expect(SIZES).toHaveProperty(size.id);
        expect(Number.isInteger(size.priceCents)).toBe(true);
        expect(size.priceCents).toBeGreaterThan(0);
      }
    }
  });

  it("gives each model a known default background", () => {
    for (const model of MODELS) expect(BACKGROUNDS).toHaveProperty(model.defaultBackgroundId);
  });

  it("finds models by id and ignores unknown ids", () => {
    expect(findModel("pix")?.name).toBe("Pix");
    expect(findModel("nao-existe")).toBeUndefined();
    expect(findModel(undefined)).toBeUndefined();
  });

  it("uses the cheapest size as the starting price", () => {
    expect(startingPriceCents({ ...MODELS[0], sizes: [
      { id: "display-10x15", priceCents: 5990 },
      { id: "adesivo-5", priceCents: 1990 },
    ] })).toBe(1990);
  });
});
