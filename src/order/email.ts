import "server-only";
import type { OrderEmailConfig } from "@/lib/env";

// Sends the order text to the store inbox through the Resend REST API.
// Throws on network errors or a non-2xx answer; the caller logs and moves on.
export async function sendOrderEmail(config: OrderEmailConfig, customerName: string, message: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      // Customer text never spans lines in the subject.
      subject: `Novo pedido: ${customerName.replace(/\s+/g, " ").trim()}`.slice(0, 120),
      text: message.replace(/\*(.+?)\*/g, "$1"),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend answered ${response.status}`);
}
