import { describe, expect, it } from "vitest";
import { initialQr, qrErrors, qrSchema } from "./qr";

const pix = { ...initialQr, mode: "pix" as const, pix: { keyType: "celular" as const, key: "(11) 91234-5678", name: "Zé", city: "Santos" } };

describe("qrSchema", () => {
  it("allows no QR code", () => {
    expect(qrSchema.parse(initialQr)).toEqual({ mode: "nenhum" });
  });

  it("builds the Pix payload from a valid key, name and city", () => {
    const result = qrSchema.parse(pix);
    expect(result).toMatchObject({ mode: "pix", key: "+5511912345678", name: "Zé", city: "Santos" });
    expect(result.mode === "pix" && result.payload).toMatch(/^000201.*br\.gov\.bcb\.pix.*6304[0-9A-F]{4}$/);
  });

  it("reports every missing Pix field next to it", () => {
    const result = qrSchema.safeParse({ ...pix, pix: { keyType: "cpf", key: "123", name: " ", city: "" } });
    expect(qrErrors(result.error!)).toEqual({
      "pix.key": "CPF inválido. Confira os números.",
      "pix.name": "Informe o nome de quem recebe.",
      "pix.city": "Informe a cidade de quem recebe.",
    });
  });

  it("limits name and city to the BR Code sizes", () => {
    const result = qrSchema.safeParse({ ...pix, pix: { ...pix.pix, name: "x".repeat(26), city: "y".repeat(16) } });
    expect(qrErrors(result.error!)).toEqual({ "pix.name": "Use no máximo 25 caracteres.", "pix.city": "Use no máximo 15 caracteres." });
  });

  it("handles the link options", () => {
    const link = { ...initialQr, mode: "link" as const };
    expect(qrSchema.parse(link)).toEqual({ mode: "link", source: "chip" });
    const own = { ...link, link: { source: "outro" as const, url: "loja.com.br", needsCreation: false } };
    expect(qrSchema.parse(own)).toEqual({ mode: "link", source: "outro", url: "https://loja.com.br/", creation: undefined });
    expect(qrSchema.parse({ ...own, link: { ...own.link, url: "", needsCreation: true } })).toMatchObject({ creation: "site", url: null });
    expect(qrErrors(qrSchema.safeParse({ ...own, link: { ...own.link, url: "meu site" } }).error!)).toEqual({
      "link.url": "Esse link não parece válido. Confira se copiou o endereço completo.",
    });
  });
});
