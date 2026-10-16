import type { Metadata } from "next";
import Link from "next/link";
import { focusRing } from "@/components/styles";

export const metadata: Metadata = {
  title: "Perguntas frequentes | Plaquinhas NFC",
  description: "Como funciona a plaquinha NFC no iPhone e no Android, se precisa de app, troca de link, pedido e privacidade.",
};

// Answers that depend on the seller (re-recording, deadlines, shipping) stay
// neutral until confirmed; see "Hipóteses e pendências" in PRODUCT.md.
const QUESTIONS = [
  {
    question: "Funciona em iPhone e Android?",
    answer:
      "Funciona na maioria dos celulares recentes. No iPhone XS ou mais novo, basta aproximar o topo do celular da plaquinha. No Android, o NFC precisa estar ligado nas configurações e o celular aproximado pelas costas. Para quem tem celular sem NFC, a plaquinha pode ter um QR code impresso: é só apontar a câmera.",
  },
  {
    question: "Precisa de algum aplicativo?",
    answer:
      "Não. O celular abre o link sozinho, direto no navegador ou no app certo (Google, Instagram, banco). Seu cliente não precisa instalar nada.",
  },
  {
    question: "Dá para trocar o link depois?",
    answer:
      "Depende de como o chip é gravado. Se você acha que vai precisar trocar o link no futuro, avise nas observações do pedido e combinamos a melhor opção pelo WhatsApp.",
  },
  {
    question: "Como pago e recebo a plaquinha?",
    answer:
      "O pedido é fechado pelo WhatsApp. Lá combinamos o valor final, a forma de pagamento, o prazo e a entrega para a sua cidade.",
  },
  {
    question: "Não tenho site nem perfil no Google. E agora?",
    answer:
      "A gente faz para você. No pedido, marque “Ainda não tenho. Quero que vocês façam.” e conte um pouco do negócio. O valor é combinado pelo WhatsApp.",
  },
  {
    question: "Meus dados ficam salvos no site?",
    answer:
      "Não. O que você preenche, incluindo a chave Pix, fica só no seu navegador e vai na mensagem que você mesmo envia pelo WhatsApp.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h1>
      <div className="flex flex-col gap-8">
        {QUESTIONS.map((item) => (
          <section key={item.question} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{item.question}</h2>
            <p className="leading-relaxed text-foreground/80">{item.answer}</p>
          </section>
        ))}
      </div>
      <p className="leading-relaxed">
        Ficou alguma dúvida?{" "}
        <Link href="/contato" className={`underline underline-offset-4 ${focusRing}`}>
          Fale com a gente
        </Link>
        .
      </p>
    </main>
  );
}
