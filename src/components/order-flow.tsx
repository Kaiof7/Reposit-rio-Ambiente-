"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, MODELS, SIZES, type ModelId } from "@/catalog/models";
import { SERVICES } from "@/catalog/services";
import { CustomizeForm } from "@/components/customize-form";
import { NfcLinkStep } from "@/components/nfc-link-step";
import { ServiceDetailsStep } from "@/components/service-details-step";
import { initialCustomization, type CustomizationInput } from "@/order/customization";
import { CREATABLE_DESTINATIONS, defaultDestinationFor, type NfcInput } from "@/order/nfc";
import { emptyServiceDetails, type DetailsService } from "@/order/services";

type StepId = "arte" | "link" | "servicos";

export function OrderFlow({ initialModelId }: { initialModelId: ModelId }) {
  const [stepId, setStepId] = useState<StepId>("arte");
  const [customization, setCustomization] = useState(() => initialCustomization(initialModelId));
  const [nfc, setNfc] = useState<NfcInput>(() => ({
    destination: defaultDestinationFor(initialModelId),
    url: "",
    needsCreation: false,
  }));
  const [serviceDetails, setServiceDetails] = useState(emptyServiceDetails);
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);

  // Services the team will create because the customer has no link yet.
  const creation = nfc.needsCreation ? CREATABLE_DESTINATIONS[nfc.destination] : undefined;
  const services: DetailsService[] = creation ? [creation] : [];
  const steps: { id: StepId; title: string }[] = [
    { id: "arte", title: "Arte do adesivo" },
    { id: "link", title: "Link do chip" },
    ...(services.length > 0 ? [{ id: "servicos" as const, title: services.map((id) => SERVICES[id].label).join(" e ") }] : []),
  ];
  const index = Math.max(0, steps.findIndex((step) => step.id === stepId));
  const step = steps[index];

  // Move focus to the new step heading so keyboard and screen reader users
  // start at the top of the step (not on first render).
  useEffect(() => {
    if (navigated.current) headingRef.current?.focus();
  }, [stepId]);

  function goTo(next: StepId) {
    navigated.current = true;
    setStatus("");
    setStepId(next);
  }

  function next() {
    const following = steps[index + 1];
    if (following) goTo(following.id);
    else setStatus("Tudo certo até aqui. A próxima etapa, o QR code opcional, chega em breve.");
  }

  function changeCustomization(value: CustomizationInput) {
    setCustomization(value);
    // Until a link is typed, the destination follows the chosen model.
    if (!nfc.url.trim() && !nfc.needsCreation) setNfc({ ...nfc, destination: defaultDestinationFor(value.modelId) });
  }

  const model = MODELS.find((candidate) => candidate.id === customization.modelId) ?? MODELS[0];
  const sizeLabel = SIZES[customization.sizeId as keyof typeof SIZES]?.label;
  const back = () => goTo(steps[index - 1].id);

  return (
    <section aria-labelledby="etapa-titulo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground/70">
          Etapa {index + 1} de {steps.length}
        </p>
        <h2 id="etapa-titulo" ref={headingRef} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
          {step.title}
        </h2>
        {index > 0 && (
          <p className="text-sm text-foreground/80">
            Plaquinha {model.name} · {sizeLabel} · {BACKGROUNDS[customization.backgroundId].label}
            {customization.artStyle === "designer" && ` · ${SERVICES.designer.label}`}
          </p>
        )}
      </div>

      {step.id === "arte" && <CustomizeForm values={customization} onChange={changeCustomization} onNext={next} />}
      {step.id === "link" && (
        <NfcLinkStep
          values={nfc}
          onChange={(value) => {
            setNfc(value);
            setStatus("");
          }}
          onBack={back}
          onNext={next}
        />
      )}
      {step.id === "servicos" && (
        <ServiceDetailsStep
          services={services}
          values={serviceDetails}
          onChange={(value) => {
            setServiceDetails(value);
            setStatus("");
          }}
          onBack={back}
          onNext={next}
        />
      )}

      <p role="status" className="text-sm">{status}</p>
    </section>
  );
}
