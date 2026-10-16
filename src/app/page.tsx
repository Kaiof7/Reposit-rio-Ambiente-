import { CATALOG_PRICES_ARE_EXAMPLES, MODELS } from "@/catalog/models";
import { ModelCard } from "@/components/model-card";

const STEPS = [
  { title: "Você escolhe o modelo", text: "Avaliação no Google, Pix, Instagram, cardápio ou o link que quiser." },
  { title: "A gente cria a arte e grava o chip", text: "Você manda o nome do negócio, a frase e o link. Nós cuidamos do resto." },
  { title: "Seu cliente aproxima o celular", text: "O link abre na hora, sem app. Quem preferir pode ler o QR code." },
];

const USES = [
  { place: "Restaurantes e lanchonetes", text: "Cardápio na mesa e pedido de avaliação no caixa." },
  { place: "Salões e barbearias", text: "Instagram para o cliente seguir e Pix para pagar." },
  { place: "Lojas", text: "Avaliação no Google no balcão para atrair mais clientes." },
  { place: "Profissionais autônomos", text: "Seu site ou agenda online a um toque de distância." },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 py-10 sm:py-16">
      <section aria-labelledby="titulo" className="flex max-w-2xl flex-col gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-foreground/70">Plaquinhas NFC</p>
        <h1 id="titulo" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Seu cliente aproxima o celular e já avalia, paga ou te segue
        </h1>
        <p className="text-lg leading-relaxed text-foreground/80">
          A plaquinha NFC tem um chip que abre um link quando o celular encosta nela. Funciona como
          um QR code, só que mais rápido. Você escolhe o modelo e a gente entrega a arte pronta e o
          chip gravado.
        </p>
        <a
          href="#modelos"
          className="inline-flex min-h-11 w-fit items-center rounded-full bg-foreground px-6 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Ver modelos
        </a>
      </section>

      <section aria-labelledby="como-funciona" className="flex flex-col gap-6">
        <h2 id="como-funciona" className="text-2xl font-semibold">Como funciona</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-1 rounded-2xl bg-foreground/5 p-4">
              <span className="text-sm font-medium text-foreground/70">Passo {index + 1}</span>
              <span className="font-semibold">{step.title}</span>
              <span className="leading-relaxed text-foreground/80">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="exemplos" className="flex flex-col gap-6">
        <h2 id="exemplos" className="text-2xl font-semibold">Para quem é</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {USES.map((use) => (
            <li key={use.place} className="flex flex-col gap-1 border-l-4 border-foreground/20 pl-4">
              <span className="font-semibold">{use.place}</span>
              <span className="leading-relaxed text-foreground/80">{use.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="modelos" aria-labelledby="titulo-modelos" className="flex scroll-mt-6 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 id="titulo-modelos" className="text-2xl font-semibold">Modelos</h2>
          {CATALOG_PRICES_ARE_EXAMPLES && (
            <p className="text-foreground/80">Valores ilustrativos. O preço final é confirmado no WhatsApp.</p>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </section>
    </main>
  );
}
