import { BACKGROUNDS, CATALOG_PRICES_ARE_EXAMPLES, MODELS, SIZES } from "@/catalog/models";
import { SERVICES } from "@/catalog/services";
import { formatPrice } from "@/lib/format";
import type { Customization } from "@/order/customization";
import { formatCep, formatPhone, type Customer } from "@/order/customer";
import { NFC_DESTINATIONS, type NfcDestination } from "@/order/nfc";
import { PIX_KEY_TYPES } from "@/order/pix";
import type { QrContent } from "@/order/qr";
import type { DetailsService } from "@/order/services";

export type Order = {
  customization: Customization;
  nfc: { destination: NfcDestination; url: string | null; creation?: DetailsService };
  qr: QrContent;
  services: {
    site?: { businessType: string; content: string; socialLinks: string };
    google?: { category: string; address: string; noFixedAddress: boolean };
  };
  customer: Customer;
};

const TO_AGREE = "valor a combinar";

const CREATE_LABEL: Record<DetailsService, string> = {
  site: "criar (pedido de site)",
  google: "criar (pedido de cadastro no Google)",
};

export function orderTotalCents(order: Order) {
  const model = MODELS.find((candidate) => candidate.id === order.customization.modelId);
  const size = model?.sizes.find((candidate) => candidate.id === order.customization.sizeId);
  return size ? { unit: size.priceCents, total: size.priceCents * order.customer.quantity } : null;
}

// Plain text for WhatsApp: *bold* section titles, one "Label: value" per line.
export function buildOrderMessage(order: Order) {
  const { customization: art, nfc, qr, services, customer } = order;
  const model = MODELS.find((candidate) => candidate.id === art.modelId);
  const price = orderTotalCents(order);
  const lines: string[] = ["*Novo pedido: Sua Plaquinha NFC*", ""];
  const section = (title: string, entries: (string | false | null | undefined)[]) => {
    lines.push(`*${title}*`, ...entries.filter((entry): entry is string => Boolean(entry)), "");
  };

  section("Plaquinha", [
    `Modelo: ${model?.name ?? art.modelId}`,
    `Tamanho: ${SIZES[art.sizeId as keyof typeof SIZES]?.label ?? art.sizeId}`,
    `Cor de fundo: ${BACKGROUNDS[art.backgroundId].label}`,
    `Nome do negócio: ${art.businessName}`,
    `Frase: ${art.callToAction}`,
    `Logo: ${art.willSendLogo ? "vou enviar por aqui" : "sem logo"}`,
    `Arte: ${art.artStyle === "designer" ? `${SERVICES.designer.label} (${TO_AGREE})` : "modelo pronto"}`,
    art.artStyle === "designer" && art.designerNotes && `Ideias para a arte: ${art.designerNotes}`,
    `Quantidade: ${customer.quantity}`,
    price &&
      `Valor${CATALOG_PRICES_ARE_EXAMPLES ? " de referência" : ""}: ${customer.quantity} × ${formatPrice(price.unit)} = ${formatPrice(price.total)}${CATALOG_PRICES_ARE_EXAMPLES ? " (a confirmar)" : ""}`,
  ]);

  section("Chip NFC", [
    `Destino: ${NFC_DESTINATIONS[nfc.destination].label}`,
    `Link: ${nfc.url ?? (nfc.creation ? CREATE_LABEL[nfc.creation] : "")}`,
  ]);

  if (qr.mode === "nenhum") section("QR code", ["Sem QR code"]);
  else if (qr.mode === "pix")
    section("QR code: Pix", [
      `Tipo de chave: ${PIX_KEY_TYPES[qr.keyType].label}`,
      `Chave: ${qr.key}`,
      `Recebedor: ${qr.name}`,
      `Cidade: ${qr.city}`,
    ]);
  else
    section("QR code: link", [
      qr.source === "chip" ? "Link: o mesmo do chip" : `Link: ${qr.url ?? CREATE_LABEL.site}`,
    ]);

  if (services.site)
    section(`${SERVICES.site.label} (${TO_AGREE})`, [
      `Ramo: ${services.site.businessType}`,
      `O que mostrar: ${services.site.content}`,
      services.site.socialLinks && `Links para o site: ${services.site.socialLinks}`,
    ]);
  if (services.google)
    section(`${SERVICES.google.label} (${TO_AGREE})`, [
      `Categoria: ${services.google.category}`,
      services.google.noFixedAddress ? "Endereço: atende sem endereço fixo" : `Endereço: ${services.google.address}`,
    ]);

  section("Cliente", [
    `Nome: ${customer.name}`,
    `WhatsApp: ${formatPhone(customer.whatsapp)}`,
    `Cidade: ${customer.city}`,
    customer.cep && `CEP: ${formatCep(customer.cep)}`,
    customer.notes && `Observações: ${customer.notes}`,
  ]);

  return lines.join("\n").trim();
}

export function whatsAppUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
