import { describe, expect, it } from "vitest";
import { buildPixPayload, crc16, isValidCnpj, isValidCpf, normalizePixKey, toBrCodeText } from "./pix";

describe("Pix keys", () => {
  it("validates CPF and CNPJ check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-80")).toBe(false);
  });

  it("normalizes keys to the Pix directory format", () => {
    expect(normalizePixKey("cpf", "529.982.247-25")).toBe("52998224725");
    expect(normalizePixKey("cnpj", "11.222.333/0001-81")).toBe("11222333000181");
    expect(normalizePixKey("celular", "(11) 91234-5678")).toBe("+5511912345678");
    expect(normalizePixKey("celular", "+55 11 91234-5678")).toBe("+5511912345678");
    expect(normalizePixKey("email", " Ze@Exemplo.com ")).toBe("ze@exemplo.com");
    expect(normalizePixKey("aleatoria", "123E4567-E12B-12D1-A456-426655440000")).toBe("123e4567-e12b-12d1-a456-426655440000");
  });

  it("rejects malformed keys", () => {
    expect(normalizePixKey("celular", "91234-5678")).toBeNull();
    expect(normalizePixKey("celular", "(01) 91234-5678")).toBeNull();
    expect(normalizePixKey("email", "ze@exemplo")).toBeNull();
    expect(normalizePixKey("aleatoria", "123")).toBeNull();
    expect(normalizePixKey("cpf", "")).toBeNull();
  });
});

describe("BR Code payload", () => {
  it("matches the example from the Banco Central BR Code manual", () => {
    const payload = buildPixPayload({ key: "123e4567-e12b-12d1-a456-426655440000", name: "Fulano de Tal", city: "BRASILIA" });
    expect(payload).toBe(
      "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D",
    );
  });

  it("strips accents and truncates name and city to the BR Code limits", () => {
    expect(toBrCodeText("  João   Conceição  ")).toBe("Joao Conceicao");
    const payload = buildPixPayload({ key: "+5511912345678", name: "Padaria Pão Quente da Esquina Ltda", city: "São José dos Campos" });
    expect(payload).toContain("5925Padaria Pao Quente da Esq");
    expect(payload).toContain("6015Sao Jose dos Ca");
    expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)));
  });
});
