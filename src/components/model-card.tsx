import Link from "next/link";
import { SIZES, startingPriceCents, type MODELS } from "@/catalog/models";
import { PlaqueIllustration } from "@/components/plaque-illustration";
import { formatPrice } from "@/lib/format";

type ModelCardProps = { model: (typeof MODELS)[number] };

export function ModelCard({ model }: ModelCardProps) {
  const headingId = `modelo-${model.id}`;
  return (
    <article aria-labelledby={headingId} className="flex flex-col gap-4 rounded-2xl border border-foreground/15 p-4">
      {/* Decorative: the same text is in the card heading and description. */}
      <div aria-hidden="true" className="mx-auto w-full max-w-56">
        <PlaqueIllustration
          modelId={model.id}
          backgroundId={model.defaultBackgroundId}
          businessName="Seu negócio"
          callToAction={model.defaultCallToAction}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="text-xl font-semibold">{model.name}</h3>
        <p className="leading-relaxed text-foreground/80">{model.summary}</p>
      </div>
      <p className="text-lg">
        a partir de <strong className="font-semibold">{formatPrice(startingPriceCents(model))}</strong>
      </p>
      <dl className="flex flex-col gap-2 border-t border-foreground/15 pt-3 text-sm">
        {model.sizes.map((size) => (
          <div key={size.id} className="flex items-baseline justify-between gap-3">
            <dt>
              <span className="block font-medium">{SIZES[size.id].label}</span>
              <span className="text-foreground/70">{SIZES[size.id].description}</span>
            </dt>
            <dd className="shrink-0 tabular-nums">{formatPrice(size.priceCents)}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={`/personalizar?modelo=${model.id}`}
        className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Personalizar<span className="sr-only"> {model.name}</span>
      </Link>
    </article>
  );
}
