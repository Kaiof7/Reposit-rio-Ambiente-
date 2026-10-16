import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { focusRing, primaryButtonClass } from "@/components/styles";
import { findWhatsAppNumber } from "@/lib/public-env";
import { formatPhone } from "@/order/customer";

export const metadata: Metadata = {
  title: "Contato | Plaquinhas NFC",
  description: "Fale com a Plaquinhas NFC pelo WhatsApp para tirar dúvidas antes do pedido.",
};

export default async function ContactPage() {
  // Render per request so a number set only at runtime is still read (a value
  // present at build time is inlined by Next and wins; see public-env.ts).
  await connection();
  const whatsapp = findWhatsAppNumber();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Contato</h1>
      <p className="leading-relaxed text-foreground/80">
        Atendemos pelo WhatsApp. Tire dúvidas sobre modelos, prazos, entrega ou sobre o site e o cadastro no Google.
      </p>
      {whatsapp ? (
        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass}
          >
            Chamar no WhatsApp<span className="sr-only"> (abre o WhatsApp)</span>
          </a>
          <p className="text-sm text-foreground/70">{formatPhone(whatsapp.slice(2))}</p>
        </div>
      ) : (
        <p className="rounded-xl bg-foreground/5 p-3 leading-relaxed">
          O WhatsApp da loja ainda não foi configurado neste site.
        </p>
      )}
      <p className="leading-relaxed">
        Se já sabe o que quer,{" "}
        <Link href="/personalizar" className={`underline underline-offset-4 ${focusRing}`}>
          monte sua plaquinha
        </Link>{" "}
        e envie o pedido pronto. Veja também as{" "}
        <Link href="/perguntas-frequentes" className={`underline underline-offset-4 ${focusRing}`}>
          perguntas frequentes
        </Link>
        .
      </p>
    </main>
  );
}
