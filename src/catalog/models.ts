// Plaque models are fixed in code (copy, icon, NFC defaults). Sizes, prices,
// availability and "esgotado" come from the seller panel (database) and fall
// back to the defaults below when no database is configured (see PRODUCT.md).

// Default sizes and prices are reversible examples until the seller edits
// them in the panel ("a definir" in PRODUCT.md).
export const DEFAULT_SIZES = {
  "adesivo-5": { label: "Adesivo 5 × 5 cm", description: "Para balcão, caixa ou mesa", shape: "square" },
  "adesivo-8": { label: "Adesivo 8 × 8 cm", description: "Mais visível em parede ou vitrine", shape: "square" },
  "display-10x15": { label: "Display de acrílico 10 × 15 cm", description: "Fica em pé no balcão", shape: "portrait" },
} as const;

export type SizeShape = "square" | "portrait";

// Every background keeps white text at WCAG AA contrast (≥ 4.5:1).
export const BACKGROUNDS = {
  azul: { label: "Azul", className: "bg-blue-700" },
  verde: { label: "Verde", className: "bg-teal-700" },
  preto: { label: "Preto", className: "bg-zinc-800" },
  rosa: { label: "Rosa", className: "bg-fuchsia-700" },
  laranja: { label: "Laranja", className: "bg-orange-700" },
  vinho: { label: "Vinho", className: "bg-rose-800" },
} as const;

export type BackgroundId = keyof typeof BACKGROUNDS;

export type PlaqueModel = {
  id: string;
  name: string;
  summary: string;
  defaultCallToAction: string;
  defaultBackgroundId: BackgroundId;
  // Integer cents to avoid binary floating-point rounding.
  sizes: { id: keyof typeof DEFAULT_SIZES; priceCents: number }[];
};

export const MODELS = [
  {
    id: "avaliacao-google",
    name: "Avaliação no Google",
    summary: "O cliente aproxima o celular e já cai na tela de deixar estrelas para o seu negócio.",
    defaultCallToAction: "Avalie a gente!",
    defaultBackgroundId: "azul",
    sizes: [
      { id: "adesivo-5", priceCents: 1990 },
      { id: "adesivo-8", priceCents: 2990 },
      { id: "display-10x15", priceCents: 5990 },
    ],
  },
  {
    id: "pix",
    name: "Pix",
    summary: "QR code Pix impresso para o cliente pagar na hora; o chip abre o link que você escolher.",
    defaultCallToAction: "Pague com Pix",
    defaultBackgroundId: "verde",
    sizes: [
      { id: "adesivo-8", priceCents: 2990 },
      { id: "display-10x15", priceCents: 5990 },
    ],
  },
  {
    id: "link-site",
    name: "Link ou site",
    summary: "Leva para o seu site, agenda online, catálogo ou qualquer outro link.",
    defaultCallToAction: "Conheça nosso site",
    defaultBackgroundId: "preto",
    sizes: [
      { id: "adesivo-5", priceCents: 1990 },
      { id: "adesivo-8", priceCents: 2990 },
      { id: "display-10x15", priceCents: 5990 },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    summary: "Abre o perfil do seu negócio para o cliente seguir em um toque.",
    defaultCallToAction: "Siga a gente!",
    defaultBackgroundId: "rosa",
    sizes: [
      { id: "adesivo-5", priceCents: 1990 },
      { id: "adesivo-8", priceCents: 2990 },
      { id: "display-10x15", priceCents: 5990 },
    ],
  },
  {
    id: "cardapio",
    name: "Cardápio",
    summary: "Na mesa do restaurante, abre o cardápio digital sem precisar de app.",
    defaultCallToAction: "Veja o cardápio",
    defaultBackgroundId: "laranja",
    sizes: [
      { id: "adesivo-5", priceCents: 1990 },
      { id: "display-10x15", priceCents: 5990 },
    ],
  },
] as const satisfies readonly PlaqueModel[];

export type ModelId = (typeof MODELS)[number]["id"];

export type CatalogSize = { id: string; label: string; description: string; shape: SizeShape };
export type CatalogOffer = { id: string; priceCents: number; soldOut: boolean };
export type CatalogModel = Omit<PlaqueModel, "id" | "sizes"> & { id: ModelId; available: boolean; sizes: CatalogOffer[] };
export type Catalog = {
  models: CatalogModel[];
  sizes: Record<string, CatalogSize>;
  // True while the code defaults are shown (no panel data yet).
  pricesAreExamples: boolean;
};

export const DEFAULT_CATALOG: Catalog = {
  models: MODELS.map((model) => ({
    ...model,
    available: true,
    sizes: model.sizes.map((size) => ({ ...size, soldOut: false })),
  })),
  sizes: Object.fromEntries(Object.entries(DEFAULT_SIZES).map(([id, size]) => [id, { id, ...size }])),
  pricesAreExamples: true,
};

export function findModel(catalog: Catalog, id: string | undefined) {
  return catalog.models.find((model) => model.id === id);
}

export function availableModels(catalog: Catalog) {
  return catalog.models.filter((model) => model.available);
}

export function orderableSizes(model: CatalogModel) {
  return model.sizes.filter((size) => !size.soldOut);
}

// Cheapest size that can still be ordered; null when everything is sold out.
export function startingPriceCents(model: CatalogModel) {
  const prices = orderableSizes(model).map((size) => size.priceCents);
  return prices.length ? Math.min(...prices) : null;
}
