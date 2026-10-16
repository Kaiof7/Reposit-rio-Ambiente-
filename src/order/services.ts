import { z } from "zod";
import type { ServiceId } from "@/catalog/services";

export const SERVICE_TEXT_MAX = 500;

const required = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, `Use no máximo ${max} caracteres.`);
const optional = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

// Details the team needs to start a site and a Google Business Profile.
// Fields of a service not requested are ignored.
export const serviceDetailsSchema = z.object({
  site: z.object({
    businessType: required("Conte qual é o ramo do negócio.", 80),
    content: required("Conte o que o site deve mostrar.", SERVICE_TEXT_MAX),
    socialLinks: optional(200),
  }),
  google: z
    .object({
      category: required("Informe a categoria do negócio.", 80),
      address: z.string().trim().max(200, "Use no máximo 200 caracteres."),
      noFixedAddress: z.boolean(),
    })
    .refine((value) => value.noFixedAddress || value.address.length > 0, {
      path: ["address"],
      message: "Informe o endereço ou marque que atende sem endereço fixo.",
    }),
});

export type ServiceDetailsInput = z.input<typeof serviceDetailsSchema>;

export const emptyServiceDetails: ServiceDetailsInput = {
  site: { businessType: "", content: "", socialLinks: "" },
  google: { category: "", address: "", noFixedAddress: false },
};

export type DetailsService = Extract<ServiceId, "site" | "google">;

// Validates only the services the customer asked for. Errors are keyed as
// "site.content", "google.address" and so on, to sit next to each field.
export function validateServiceDetails(details: ServiceDetailsInput, services: readonly DetailsService[]) {
  const errors: Record<string, string> = {};
  for (const service of services) {
    const result = serviceDetailsSchema.shape[service].safeParse(details[service]);
    if (result.success) continue;
    for (const issue of result.error.issues) {
      const key = `${service}.${String(issue.path[0])}`;
      errors[key] ??= issue.message;
    }
  }
  return errors;
}
