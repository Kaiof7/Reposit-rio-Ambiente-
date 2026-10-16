import { describe, expect, it } from "vitest";
import { fieldErrors } from "./field-errors";
import { customerSchema, emptyCustomer, formatCep, formatPhone, type CustomerField } from "./customer";

const valid = { name: " Zé Silva ", whatsapp: "+55 (11) 91234-5678", city: "Santos", cep: "11010-000", quantity: "3", notes: "" };

describe("customerSchema", () => {
  it("normalizes phone, CEP and quantity", () => {
    expect(customerSchema.parse(valid)).toEqual({ name: "Zé Silva", whatsapp: "11912345678", city: "Santos", cep: "11010000", quantity: 3, notes: "" });
    expect(customerSchema.parse({ ...valid, whatsapp: "1133334444", cep: "" })).toMatchObject({ whatsapp: "1133334444", cep: "" });
  });

  it("reports each invalid field in Portuguese", () => {
    const result = customerSchema.safeParse({ ...emptyCustomer, whatsapp: "91234", cep: "123", quantity: "0" });
    expect(fieldErrors<CustomerField>(result.error!)).toEqual({
      name: "Informe seu nome.",
      whatsapp: "Informe o WhatsApp com DDD, como (11) 91234-5678.",
      city: "Informe sua cidade.",
      cep: "CEP inválido. Use 8 números, como 01310-100.",
      quantity: "A quantidade mínima é 1.",
    });
  });

  it("rejects fractional, empty and too large quantities", () => {
    const error = (quantity: string) => fieldErrors<CustomerField>(customerSchema.safeParse({ ...valid, quantity }).error!).quantity;
    expect(error("1.5")).toBe("Use um número inteiro.");
    expect(error("abc")).toBe("Informe a quantidade.");
    expect(error(" ")).toBe("Informe a quantidade.");
    expect(error("101")).toMatch(/mais de 100 unidades/);
  });
});

it("formats phone and CEP for reading", () => {
  expect(formatPhone("11912345678")).toBe("(11) 91234-5678");
  expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  expect(formatCep("11010000")).toBe("11010-000");
});
