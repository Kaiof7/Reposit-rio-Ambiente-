import { expect, it } from "vitest";
import { DEFAULT_CATALOG } from "./models";
import { catalogFromRows, defaultRows } from "./rows";

it("keeps the code defaults until the panel saves something", () => {
  expect(catalogFromRows({ sizes: [], settings: [], offers: [] })).toBe(DEFAULT_CATALOG);
});

it("seed rows reproduce the defaults, now as real prices", () => {
  const catalog = catalogFromRows(defaultRows());
  expect(catalog.pricesAreExamples).toBe(false);
  expect(catalog.sizes).toEqual(DEFAULT_CATALOG.sizes);
  expect(catalog.models).toEqual(DEFAULT_CATALOG.models);
});

it("applies panel data: order by position, hidden models, sold out, dropped sizes", () => {
  const rows = defaultRows();
  const catalog = catalogFromRows({
    sizes: [...rows.sizes, { id: "adesivo-10", label: "Adesivo 10 × 10 cm", description: "", shape: "square", position: -1 }],
    settings: rows.settings.map((setting) => ({ ...setting, available: setting.modelId !== "instagram" })),
    offers: [
      { modelId: "pix", sizeId: "display-10x15", priceCents: 6490, soldOut: false },
      { modelId: "pix", sizeId: "adesivo-10", priceCents: 3990, soldOut: true },
      { modelId: "pix", sizeId: "removido", priceCents: 100, soldOut: false },
    ],
  });
  expect(Object.keys(catalog.sizes)[0]).toBe("adesivo-10");
  expect(catalog.models.find((model) => model.id === "instagram")?.available).toBe(false);
  expect(catalog.models.find((model) => model.id === "pix")?.sizes).toEqual([
    { id: "adesivo-10", priceCents: 3990, soldOut: true },
    { id: "display-10x15", priceCents: 6490, soldOut: false },
  ]);
  expect(catalog.models.find((model) => model.id === "cardapio")?.sizes).toEqual([]);
});
