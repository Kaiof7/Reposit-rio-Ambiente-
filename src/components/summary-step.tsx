"use client";

import { useState } from "react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { whatsAppUrl } from "@/order/message";

type SummaryStepProps = {
  message: string | null;
  whatsappNumber: string | null;
  onBack: () => void;
};

// Shows the exact WhatsApp message, with *title* lines rendered as headings.
export function SummaryStep({ message, whatsappNumber, onBack }: SummaryStepProps) {
  const [notice, setNotice] = useState("");

  if (!message) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <p role="alert" className="font-medium">Alguma etapa ficou incompleta. Volte e revise antes de enviar.</p>
        <button type="button" onClick={onBack} className={secondaryButtonClass}>Voltar</button>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message ?? "");
      setNotice("Mensagem copiada.");
    } catch {
      setNotice("Não foi possível copiar. Selecione o texto do resumo e copie manualmente.");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="leading-relaxed text-foreground/80">
        Confira tudo. Ao tocar em “Enviar pelo WhatsApp”, o app abre com esta mensagem pronta: é só enviar.
      </p>
      <div className="flex flex-col rounded-2xl border border-foreground/15 p-4 leading-relaxed">
        {message.split("\n").map((line, index) => {
          const title = /^\*(.+)\*$/.exec(line);
          if (title) return <h3 key={index} className="mt-3 font-semibold first:mt-0">{title[1]}</h3>;
          if (!line) return null;
          return <p key={index} className="[overflow-wrap:anywhere]">{line}</p>;
        })}
      </div>

      {!whatsappNumber && (
        <p className="rounded-xl bg-foreground/5 p-3 text-sm leading-relaxed">
          O WhatsApp da loja ainda não foi configurado neste site. Copie a mensagem e envie para a loja pelo seu
          WhatsApp.
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-foreground/15 pt-6 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={onBack} className={secondaryButtonClass}>Voltar</button>
        <button type="button" onClick={copy} className={secondaryButtonClass}>Copiar mensagem</button>
        {whatsappNumber && (
          <a
            href={whatsAppUrl(whatsappNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setNotice("Abrimos o WhatsApp com a mensagem. Se não abriu, use “Copiar mensagem”.")}
            className={primaryButtonClass}
          >
            Enviar pelo WhatsApp<span className="sr-only"> (abre o WhatsApp)</span>
          </a>
        )}
      </div>
      <p role="status" className="text-sm">{notice}</p>
    </div>
  );
}
