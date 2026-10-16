"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, MODELS, SIZES, type ModelId } from "@/catalog/models";
import { CustomizeForm } from "@/components/customize-form";
import { NfcLinkStep } from "@/components/nfc-link-step";
import { initialCustomization, type CustomizationInput } from "@/order/customization";
import { defaultDestinationFor, type NfcInput } from "@/order/nfc";

const STEPS = ["Arte do adesivo", "Link do chip"];

export function OrderFlow({ initialModelId }: { initialModelId: ModelId }) {
  const [step, setStep] = useState(0);
  const [customization, setCustomization] = useState(() => initialCustomization(initialModelId));
  const [nfc, setNfc] = useState<NfcInput>(() => ({ destination: defaultDestinationFor(initialModelId), url: "" }));
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);

  // Move focus to the new step heading so keyboard and screen reader users
  // start at the top of the step (not on first render).
  useEffect(() => {
    if (navigated.current) headingRef.current?.focus();
  }, [step]);

  function goTo(next: number) {
    navigated.current = true;
    setStatus("");
    setStep(next);
  }

  function changeCustomization(next: CustomizationInput) {
    setCustomization(next);
    // Until a link is typed, the destination follows the chosen model.
    if (!nfc.url.trim()) setNfc({ ...nfc, destination: defaultDestinationFor(next.modelId) });
  }

  const model = MODELS.find((candidate) => candidate.id === customization.modelId) ?? MODELS[0];
  const sizeLabel = SIZES[customization.sizeId as keyof typeof SIZES]?.label;

  return (
    <section aria-labelledby="etapa-titulo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground/70">
          Etapa {step + 1} de {STEPS.length}
        </p>
        <h2 id="etapa-titulo" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
          {STEPS[step]}
        </h2>
        {step > 0 && (
          <p className="text-sm text-foreground/80">
            Plaquinha {model.name} · {sizeLabel} · {BACKGROUNDS[customization.backgroundId].label}
          </p>
        )}
      </div>

      {step === 0 ? (
        <CustomizeForm values={customization} onChange={changeCustomization} onNext={() => goTo(1)} />
      ) : (
        <NfcLinkStep
          values={nfc}
          onChange={(next) => {
            setNfc(next);
            setStatus("");
          }}
          onBack={() => goTo(0)}
          onNext={() => setStatus("Link do chip pronto. A próxima etapa, o QR code opcional, chega em breve.")}
        />
      )}

      <p role="status" className="text-sm">{status}</p>
    </section>
  );
}
