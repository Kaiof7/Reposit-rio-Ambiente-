"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, MODELS, SIZES, type ModelId } from "@/catalog/models";
import { SERVICES } from "@/catalog/services";
import { CustomizeForm } from "@/components/customize-form";
import { NfcLinkStep } from "@/components/nfc-link-step";
import { QrCodeStep, type ChipTarget } from "@/components/qr-code-step";
import { ServiceDetailsStep } from "@/components/service-details-step";
import { CustomerStep } from "@/components/customer-step";
import { SummaryStep } from "@/components/summary-step";
import { assembleOrder } from "@/order/assemble";
import { emptyCustomer } from "@/order/customer";
import { buildOrderMessage } from "@/order/message";
import { initialCustomization, type CustomizationInput } from "@/order/customization";
import { defaultDestinationFor, nfcSchema, type NfcInput } from "@/order/nfc";
import { initialQr, qrSchema, type QrInput } from "@/order/qr";
import { emptyServiceDetails, type DetailsService } from "@/order/services";

type StepId = "arte" | "link" | "qr" | "servicos" | "dados" | "resumo";

const qrFor = (modelId: ModelId): QrInput => ({ ...initialQr, mode: modelId === "pix" ? "pix" : "nenhum" });

export function OrderFlow({ initialModelId, whatsappNumber }: { initialModelId: ModelId; whatsappNumber: string | null }) {
  const [stepId, setStepId] = useState<StepId>("arte");
  const [customization, setCustomization] = useState(() => initialCustomization(initialModelId));
  const [nfc, setNfc] = useState<NfcInput>(() => ({
    destination: defaultDestinationFor(initialModelId),
    url: "",
    needsCreation: false,
  }));
  const [qr, setQr] = useState(() => qrFor(initialModelId));
  const [serviceDetails, setServiceDetails] = useState(emptyServiceDetails);
  const [customer, setCustomer] = useState(emptyCustomer);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const qrTouched = useRef(false);

  // Services the team will create because the customer has no link yet.
  const chipResult = nfcSchema.safeParse(nfc);
  const chip: ChipTarget = !chipResult.success ? null
    : chipResult.data.url ? { url: chipResult.data.url }
    : chipResult.data.creation ? { creation: chipResult.data.creation }
    : null;
  const qrResult = qrSchema.safeParse(qr);
  const requested = new Set<DetailsService>();
  if (chip && "creation" in chip) requested.add(chip.creation);
  if (qrResult.success && qrResult.data.mode === "link" && "creation" in qrResult.data && qrResult.data.creation) {
    requested.add(qrResult.data.creation);
  }
  const services = (["site", "google"] as const).filter((id) => requested.has(id));
  const steps: { id: StepId; title: string }[] = [
    { id: "arte", title: "Arte do adesivo" },
    { id: "link", title: "Link do chip" },
    { id: "qr", title: "QR code" },
    ...(services.length > 0 ? [{ id: "servicos" as const, title: services.map((id) => SERVICES[id].label).join(" e ") }] : []),
    { id: "dados", title: "Seus dados" },
    { id: "resumo", title: "Resumo do pedido" },
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
    setStepId(next);
  }

  function next() {
    const following = steps[index + 1];
    if (following) goTo(following.id);
  }

  function changeCustomization(value: CustomizationInput) {
    setCustomization(value);
    // Until a link is typed, the destination follows the chosen model.
    if (!nfc.url.trim() && !nfc.needsCreation) setNfc({ ...nfc, destination: defaultDestinationFor(value.modelId) });
    if (!qrTouched.current) setQr(qrFor(value.modelId));
  }

  const order = step.id === "resumo" ? assembleOrder({ customization, nfc, qr, serviceDetails, customer }, services) : null;
  const unitPrice = MODELS.find((candidate) => candidate.id === customization.modelId)?.sizes.find((size) => size.id === customization.sizeId);
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
          onChange={setNfc}
          onBack={back}
          onNext={next}
        />
      )}
      {step.id === "qr" && (
        <QrCodeStep
          values={qr}
          chip={chip}
          onChange={(value) => {
            qrTouched.current = true;
            setQr(value);
                  }}
          onBack={back}
          onNext={next}
        />
      )}
      {step.id === "servicos" && (
        <ServiceDetailsStep
          services={services}
          values={serviceDetails}
          onChange={setServiceDetails}
          onBack={back}
          onNext={next}
        />
      )}
      {step.id === "dados" && (
        <CustomerStep
          values={customer}
          unitPriceCents={unitPrice?.priceCents ?? null}
          onChange={setCustomer}
          onBack={back}
          onNext={next}
        />
      )}
      {step.id === "resumo" && (
        <SummaryStep message={order ? buildOrderMessage(order) : null} whatsappNumber={whatsappNumber} onBack={back} />
      )}

    </section>
  );
}
