import { describe, expect, it } from "vitest";
import { buildOrderMessage, whatsAppUrl, type Order } from "./message";

const base: Order = {
  customization: {
    modelId: "avaliacao-google",
    sizeId: "adesivo-8",
    backgroundId: "azul",
    businessName: "Padaria Pão Quente",
    callToAction: "Avalie a gente!",
    willSendLogo: true,
    artStyle: "modelo",
    designerNotes: "",
  },
  nfc: { destination: "avaliacao-google", url: "https://g.page/r/Cabc/review" },
  qr: { mode: "nenhum" },
  services: {},
  customer: { name: "Zé Silva", whatsapp: "11912345678", city: "Santos", cep: "11010000", quantity: 2, notes: "Entregar à tarde" },
};

describe("buildOrderMessage", () => {
  it("lists the plaque, chip, QR code and customer in readable sections", () => {
    expect(buildOrderMessage(base)).toBe(
      [
        "*Novo pedido: Plaquinhas NFC*",
        "",
        "*Plaquinha*",
        "Modelo: Avaliação no Google",
        "Tamanho: Adesivo 8 × 8 cm",
        "Cor de fundo: Azul",
        "Nome do negócio: Padaria Pão Quente",
        "Frase: Avalie a gente!",
        "Logo: vou enviar por aqui",
        "Arte: modelo pronto",
        "Quantidade: 2",
        "Valor de referência: 2 × R$ 29,90 = R$ 59,80 (a confirmar)",
        "",
        "*Chip NFC*",
        "Destino: Avaliação no Google",
        "Link: https://g.page/r/Cabc/review",
        "",
        "*QR code*",
        "Sem QR code",
        "",
        "*Cliente*",
        "Nome: Zé Silva",
        "WhatsApp: (11) 91234-5678",
        "Cidade: Santos",
        "CEP: 11010-000",
        "Observações: Entregar à tarde",
      ].join("\n"),
    );
  });

  it("includes Pix data, extra services, custom art and links to create", () => {
    const message = buildOrderMessage({
      ...base,
      customization: { ...base.customization, artStyle: "designer", designerNotes: "Azul e amarelo" },
      nfc: { destination: "avaliacao-google", url: null, creation: "google" },
      qr: { mode: "pix", keyType: "celular", key: "+5511912345678", name: "Zé Silva", city: "Santos", payload: "000201" },
      services: {
        google: { category: "Padaria", address: "", noFixedAddress: true },
        site: { businessType: "Padaria", content: "Cardápio e horário", socialLinks: "" },
      },
      customer: { ...base.customer, cep: "", notes: "" },
    });
    expect(message).toContain("Arte: Arte sob medida (valor a combinar)");
    expect(message).toContain("Ideias para a arte: Azul e amarelo");
    expect(message).toContain("Link: criar (pedido de cadastro no Google)");
    expect(message).toContain("*QR code: Pix*\nTipo de chave: Celular\nChave: +5511912345678\nRecebedor: Zé Silva\nCidade: Santos");
    expect(message).toContain("*Criação de site (valor a combinar)*\nRamo: Padaria\nO que mostrar: Cardápio e horário\n");
    expect(message).toContain("*Cadastro no Google (valor a combinar)*\nCategoria: Padaria\nEndereço: atende sem endereço fixo");
    expect(message).not.toContain("CEP:");
    expect(message).not.toContain("Observações:");
    expect(message).not.toContain("Links para o site");
  });

  it("describes link QR codes", () => {
    expect(buildOrderMessage({ ...base, qr: { mode: "link", source: "chip" } })).toContain("*QR code: link*\nLink: o mesmo do chip");
    expect(buildOrderMessage({ ...base, qr: { mode: "link", source: "outro", url: null, creation: "site" } })).toContain("Link: criar (pedido de site)");
  });
});

it("encodes the whole message into the wa.me link", () => {
  const message = buildOrderMessage(base);
  const url = whatsAppUrl("5511999998888", message);
  expect(url.startsWith("https://wa.me/5511999998888?text=")).toBe(true);
  expect(new URL(url).searchParams.get("text")).toBe(message);
});
