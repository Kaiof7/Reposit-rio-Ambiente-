import type { ModelId } from "@/catalog/models";
import { cn } from "@/lib/utils";

// Illustrative rendering while there are no product photos (PRODUCT.md).
const THEMES: Record<ModelId, { surface: string; glyph: string }> = {
  "avaliacao-google": { surface: "bg-blue-700", glyph: "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" },
  pix: { surface: "bg-teal-700", glyph: "M12 3l9 9-9 9-9-9z M12 8l4 4-4 4-4-4z" },
  "link-site": { surface: "bg-zinc-800", glyph: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
  instagram: { surface: "bg-fuchsia-700", glyph: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M17.5 6.5h.01" },
  cardapio: { surface: "bg-orange-700", glyph: "M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4" },
};

type PlaqueIllustrationProps = {
  modelId: ModelId;
  businessName: string;
  callToAction: string;
  className?: string;
};

export function PlaqueIllustration({ modelId, businessName, callToAction, className }: PlaqueIllustrationProps) {
  const theme = THEMES[modelId];
  return (
    <div
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center text-white shadow-sm",
        theme.surface,
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-10 fill-none stroke-current stroke-[1.75]">
        <path d={theme.glyph} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-lg font-semibold leading-tight">{callToAction}</p>
      <p className="text-sm opacity-90">{businessName}</p>
      <p className="mt-1 rounded-full border border-white/60 px-2 py-0.5 text-xs">Aproxime o celular</p>
    </div>
  );
}
