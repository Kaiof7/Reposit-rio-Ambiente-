import { BACKGROUNDS, SIZES, type BackgroundId, type ModelId, type SizeId } from "@/catalog/models";
import { cn } from "@/lib/utils";

// Illustrative rendering of the plaque: stands in for product photos on the
// storefront and is the live preview while customizing (PRODUCT.md).
const GLYPHS: Record<ModelId, string> = {
  "avaliacao-google": "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z",
  pix: "M12 3l9 9-9 9-9-9z M12 8l4 4-4 4-4-4z",
  "link-site": "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M17.5 6.5h.01",
  cardapio: "M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4",
};

type PlaqueIllustrationProps = {
  modelId: ModelId;
  backgroundId: BackgroundId;
  businessName: string;
  callToAction: string;
  sizeId?: SizeId;
  showLogo?: boolean;
  className?: string;
};

export function PlaqueIllustration({
  modelId,
  backgroundId,
  businessName,
  callToAction,
  sizeId,
  showLogo = false,
  className,
}: PlaqueIllustrationProps) {
  const portrait = sizeId !== undefined && SIZES[sizeId].shape === "portrait";
  return (
    // Sizes follow the plaque width (cqw) so it reads the same at any scale.
    <div className={cn("@container", className)}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-[4cqw] rounded-[8cqw] p-[8cqw] text-center text-white shadow-sm",
          portrait ? "aspect-[2/3]" : "aspect-square",
          BACKGROUNDS[backgroundId].className,
        )}
      >
        {showLogo ? (
          <span className="flex size-[18cqw] items-center justify-center rounded-full border border-dashed border-white/80 text-[5cqw] font-medium">
            LOGO
          </span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18cqw] fill-none stroke-current stroke-[1.75]">
            <path d={GLYPHS[modelId]} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <p className="text-[9cqw] font-semibold leading-tight [overflow-wrap:anywhere]">{callToAction}</p>
        <p className="text-[6.5cqw] leading-tight opacity-90 [overflow-wrap:anywhere]">{businessName}</p>
        <p className="mt-[2cqw] rounded-full border border-white/60 px-[4cqw] py-[1cqw] text-[5cqw]">
          Aproxime o celular
        </p>
      </div>
    </div>
  );
}
