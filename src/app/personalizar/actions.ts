"use server";

import { getCatalog } from "@/catalog/load";
import { getOrderEmailConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { assembleOrder, requestedServices, type OrderInputs } from "@/order/assemble";
import { sendOrderEmail } from "@/order/email";
import { buildOrderMessage } from "@/order/message";

// Public endpoint: the order is revalidated here from the raw inputs, and the
// e-mail goes only to the store address from the environment.
export async function emailOrderAction(inputs: OrderInputs): Promise<boolean> {
  const config = getOrderEmailConfig();
  if (!config) return false;
  try {
    const catalog = await getCatalog();
    const order = assembleOrder(catalog, inputs, requestedServices(inputs.nfc, inputs.qr));
    if (!order) return false;
    await sendOrderEmail(config, order.customer.name, buildOrderMessage(catalog, order));
    return true;
  } catch (error) {
    // Never log order content: it carries customer data and Pix keys.
    logger.error({ reason: error instanceof Error ? error.message : "unknown" }, "Order e-mail failed");
    return false;
  }
}
