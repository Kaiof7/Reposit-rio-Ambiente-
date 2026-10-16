// Typed catalog of plaque models. The MVP has no database (see PRODUCT.md):
// this file is the source of truth for the storefront and, later, the order.

// Prices, sizes and copy are reversible examples until the seller confirms
// them ("a definir" in PRODUCT.md). Flip this flag when they are real.
export const CATALOG_PRICES_ARE_EXAMPLES = true;

export const SIZES = {
  "adesivo-5": { label: "Adesivo 5 × 5 cm", description: "Para balcão, caixa ou mesa" },
  "adesivo-8": { label: "Adesivo 8 × 8 cm", description: "Mais visível em parede ou vitrine" },
  "display-10x15": { label: "Display de acrílico 10 × 15 cm", description: "Fica em pé no balcão" },
} as const;

export type SizeId = keyof typeof SIZES;

export type PlaqueModel = {
  id: string;
  name: string;
  summary: string;
  defaultCallToAction: string;
  // Integer cents to avoid binary floating-point rounding.
  sizes: { id: SizeId; priceCents: number }[];
};

export const MODELS = [
  {
    id: "avaliacao-google",
    name: "Avaliação no Google",
    summary: "O cliente aproxima o celular e já cai na tela de deixar estrelas para o seu negócio.",
    defaultCallToAction: "Avalie a gente!",
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
