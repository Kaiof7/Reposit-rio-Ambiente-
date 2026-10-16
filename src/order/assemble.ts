import { customizationSchema, type CustomizationInput } from "@/order/customization";
import { customerSchema, type CustomerInput } from "@/order/customer";
import type { Order } from "@/order/message";
import { nfcSchema, type NfcInput } from "@/order/nfc";
import { qrSchema, type QrInput } from "@/order/qr";
import { serviceDetailsSchema, type DetailsService, type ServiceDetailsInput } from "@/order/services";

export type OrderInputs = {
  customization: CustomizationInput;
  nfc: NfcInput;
  qr: QrInput;
  serviceDetails: ServiceDetailsInput;
  customer: CustomerInput;
};

// Revalidates every step and returns the order, or null if any step is
// incomplete. Service details are kept only for the services requested.
export function assembleOrder(inputs: OrderInputs, services: readonly DetailsService[]): Order | null {
  const customization = customizationSchema.safeParse(inputs.customization);
  const nfc = nfcSchema.safeParse(inputs.nfc);
  const qr = qrSchema.safeParse(inputs.qr);
  const customer = customerSchema.safeParse(inputs.customer);
  const site = services.includes("site") ? serviceDetailsSchema.shape.site.safeParse(inputs.serviceDetails.site) : null;
  const google = services.includes("google") ? serviceDetailsSchema.shape.google.safeParse(inputs.serviceDetails.google) : null;
  if (!customization.success || !nfc.success || !qr.success || !customer.success) return null;
  if ((site && !site.success) || (google && !google.success)) return null;
  return {
    customization: customization.data,
    nfc: nfc.data,
    qr: qr.data,
    services: { site: site?.data, google: google?.data },
    customer: customer.data,
  };
}
