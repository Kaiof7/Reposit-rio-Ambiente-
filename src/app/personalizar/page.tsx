import type { Metadata } from "next";
import Link from "next/link";
import { MODELS, findModel } from "@/catalog/models";
import { OrderFlow } from "@/components/order-flow";
import { findWhatsAppNumber } from "@/lib/public-env";

export const metadata: Metadata = {
  title: "Monte sua plaquinha | Sua Plaquinha NFC",
  description: "Escolha modelo, tamanho e cor, veja a prévia da plaquinha e informe o link gravado no chip.",
};

export default async function CustomizePage(props: PageProps<"/personalizar">) {
  const { modelo } = await props.searchParams;
  const model = findModel(typeof modelo === "string" ? modelo : undefined) ?? MODELS[0];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <Link href="/#modelos" className="w-fit underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
        Voltar para os modelos
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Monte sua plaquinha</h1>
        <p className="text-foreground/80">Em poucas etapas, sem cadastro. A arte final é feita pela nossa equipe.</p>
      </div>
      {/* key resets the flow when the model in the URL changes. */}
      <OrderFlow key={model.id} initialModelId={model.id} whatsappNumber={findWhatsAppNumber()} />
    </main>
  );
}
