import { z } from "zod";

// Example limit until the seller defines one ("a definir" in PRODUCT.md).
export const QUANTITY_MAX = 100;
export const NOTES_MAX = 500;

const max = (limit: number) => `Use no máximo ${limit} caracteres.`;

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, max(80)),
  whatsapp: z
    .string()
    .transform((value) => value.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, ""))
    .pipe(z.string().regex(/^[1-9]{2}9?\d{8}$/, "Informe o WhatsApp com DDD, como (11) 91234-5678.")),
  city: z.string().trim().min(2, "Informe sua cidade.").max(60, max(60)),
  cep: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^(\d{8})?$/, "CEP inválido. Use 8 números, como 01310-100.")),
  quantity: z
    .string()
    .trim()
    .min(1, "Informe a quantidade.")
    .pipe(z.coerce.number("Informe a quantidade."))
    .pipe(
      z
        .number()
        .int("Use um número inteiro.")
        .min(1, "A quantidade mínima é 1.")
        .max(QUANTITY_MAX, `Para mais de ${QUANTITY_MAX} unidades, fale com a gente nas observações.`),
    ),
  notes: z.string().trim().max(NOTES_MAX, max(NOTES_MAX)),
});

export type CustomerInput = { name: string; whatsapp: string; city: string; cep: string; quantity: string; notes: string };
export type Customer = z.output<typeof customerSchema>;
export type CustomerField = keyof CustomerInput;

export const emptyCustomer: CustomerInput = { name: "", whatsapp: "", city: "", cep: "", quantity: "1", notes: "" };

export function formatPhone(digits: string) {
  return digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
}

export function formatCep(digits: string) {
  return digits.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}
