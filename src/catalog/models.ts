// Typed catalog of plaque models. The MVP has no database (see PRODUCT.md):
// this file is the source of truth for the storefront and, later, the order.

// Prices, sizes and copy are reversible examples until the seller confirms
// them ("a definir" in PRODUCT.md). Flip this flag when they are real.
export const CATALOG_PRICES_ARE_EXAMPLES = true;

export const SIZES = {
  "adesivo-5": { label: "Adesivo 5 × 5 cm", description: "Para balcão, caixa ou mesa", shape: "square" },
  "adesivo-8": { label: "Adesivo 8 × 8 cm", description: "Mais visível em parede ou vitrine", shape: "square" },
  "display-10x15": { label: "Display de acrílico 10 × 15 cm", description: "Fica em pé no balcão", shape: "portrait" },
} as const;

export type SizeId = keyof typeof SIZES;

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
  sizes: { id: SizeId; priceCents: number }[];
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

export function startingPriceCents(model: PlaqueModel) {
  return Math.min(...model.sizes.map((size) => size.priceCents));
}

export function findModel(id: string | undefined) {
  return MODELS.find((model) => model.id === id);
}
