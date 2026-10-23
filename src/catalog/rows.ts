import type { ModelSettingRow, ModelSizeRow, SizeRow } from "@/db/schema";
import { DEFAULT_CATALOG, MODELS, type Catalog } from "./models";

type CatalogRows = { sizes: SizeRow[]; settings: ModelSettingRow[]; offers: ModelSizeRow[] };

// Builds the store catalog from panel data. No size rows means the panel was
// never used: the code defaults stay, still marked as example prices.
export function catalogFromRows({ sizes, settings, offers }: CatalogRows): Catalog {
  if (sizes.length === 0) return DEFAULT_CATALOG;
  const ordered = [...sizes].sort((a, b) => a.position - b.position || a.label.localeCompare(b.label));
  const position = new Map(ordered.map((size, index) => [size.id, index]));
  return {
    sizes: Object.fromEntries(
      ordered.map((size) => [size.id, { id: size.id, label: size.label, description: size.description, shape: size.shape }]),
    ),
    models: MODELS.map((model) => ({
      ...model,
      available: settings.find((setting) => setting.modelId === model.id)?.available ?? true,
      sizes: offers
        .filter((offer) => offer.modelId === model.id && position.has(offer.sizeId))
        .sort((a, b) => position.get(a.sizeId)! - position.get(b.sizeId)!)
        .map((offer) => ({ id: offer.sizeId, priceCents: offer.priceCents, soldOut: offer.soldOut })),
    })),
    pricesAreExamples: false,
  };
}

// Rows that reproduce the code defaults, used to seed the panel's first save.
export function defaultRows(): CatalogRows {
  return {
    sizes: Object.values(DEFAULT_CATALOG.sizes).map((size, index) => ({ ...size, position: index })),
    settings: DEFAULT_CATALOG.models.map((model) => ({ modelId: model.id, available: true })),
    offers: DEFAULT_CATALOG.models.flatMap((model) =>
      model.sizes.map((size) => ({ modelId: model.id, sizeId: size.id, priceCents: size.priceCents, soldOut: false })),
    ),
  };
}
