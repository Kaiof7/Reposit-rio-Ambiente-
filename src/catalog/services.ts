// Extra services offered with the plaque. Prices are agreed on WhatsApp
// ("a definir" in PRODUCT.md), so the site never shows a value for them.

export const SERVICES = {
  site: {
    label: "Criação de site",
    summary: "Um site simples para o seu negócio, com serviços, contatos e botão do WhatsApp. Também serve como cardápio digital.",
  },
  google: {
    label: "Cadastro no Google",
    summary: "Criamos o Perfil da Empresa no Google para você receber avaliações. A verificação final é feita por você, com nossa ajuda.",
  },
  designer: {
    label: "Arte sob medida",
    summary: "Um profissional de mídia cria a arte da sua plaquinha do zero, do jeito que você imaginar.",
  },
} as const;

export type ServiceId = keyof typeof SERVICES;

export const SERVICE_PRICE_NOTE = "Valor combinado pelo WhatsApp";

// Sites made by the team, shown as proof of work. Descriptions must match
// the real site; confirm with the seller when adding one.
export const SAMPLE_SITES = [
  {
    id: "assistencia-celular",
    name: "Assistência técnica de celular",
    description: "Site de orçamento para uma assistência de celulares.",
    url: "https://orcamento-assistencia-celular.vercel.app",
  },
  {
    id: "lanchonete",
    name: "Lanchonete",
    description: "Site para uma lanchonete.",
    url: "https://lanchonete-site-ruddy.vercel.app",
  },
] as const;
