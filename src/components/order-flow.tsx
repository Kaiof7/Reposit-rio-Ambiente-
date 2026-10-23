"use client";

import { useEffect, useRef, useState } from "react";
import { BACKGROUNDS, findModel, type Catalog, type ModelId } from "@/catalog/models";
import { SERVICES } from "@/catalog/services";
import { CustomizeForm } from "@/components/customize-form";
import { NfcLinkStep } from "@/components/nfc-link-step";
import { QrCodeStep, type ChipTarget } from "@/components/qr-code-step";
import { ServiceDetailsStep } from "@/components/service-details-step";
import { CustomerStep } from "@/components/customer-step";
import { SummaryStep } from "@/components/summary-step";
import { emailOrderAction } from "@/app/personalizar/actions";
import { assembleOrder, requestedServices } from "@/order/assemble";
import { emptyCustomer } from "@/order/customer";
import { buildOrderMessage } from "@/order/message";
import { initialCustomization, type CustomizationInput } from "@/order/customization";
import { defaultDestinationFor, nfcSchema, type NfcInput } from "@/order/nfc";
import { initialQr, type QrInput } from "@/order/qr";
import { emptyServiceDetails } from "@/order/services";

type StepId = "arte" | "link" | "qr" | "servicos" | "dados" | "resumo";

const qrFor = (modelId: ModelId): QrInput => ({ ...initialQr, mode: modelId === "pix" ? "pix" : "nenhum" });

type OrderFlowProps = { catalog: Catalog; initialModelId: ModelId; whatsappNumber: string | null; orderEmail: boolean };

export function OrderFlow({ catalog, initialModelId, whatsappNumber, orderEmail }: OrderFlowProps) {
  const [stepId, setStepId] = useState<StepId>("arte");
  const [customization, setCustomization] = useState(() => initialCustomization(catalog, initialModelId));
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
  const emailedMessage = useRef<string | null>(null);

  // Services the team will create because the customer has no link yet.
  const chipResult = nfcSchema.safeParse(nfc);
  const chip: ChipTarget = !chipResult.success ? null
    : chipResult.data.url ? { url: chipResult.data.url }
    : chipResult.data.creation ? { creation: chipResult.data.creation }
    : null;
  const services = requestedServices(nfc, qr);
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

  const inputs = { customization, nfc, qr, serviceDetails, customer };
  const order = step.id === "resumo" ? assembleOrder(catalog, inputs, services) : null;
  const message = order ? buildOrderMessage(catalog, order) : null;
  // One e-mail copy per distinct message, on the first send or copy.
  const sendEmailCopy = () => {
    if (!orderEmail || !message || emailedMessage.current === message) return;
    emailedMessage.current = message;
    emailOrderAction(inputs).catch(() => {});
  };
  const model = findModel(catalog, customization.modelId) ?? catalog.models[0];
  const unitPrice = model.sizes.find((size) => size.id === customization.sizeId);
  const sizeLabel = catalog.sizes[customization.sizeId]?.label;
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

      {step.id === "arte" && <CustomizeForm catalog={catalog} values={customization} onChange={changeCustomization} onNext={next} />}
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
        <SummaryStep
          message={message}
          whatsappNumber={whatsappNumber}
          orderEmail={orderEmail}
          onSend={sendEmailCopy}
          onBack={back}
        />
      )}

    </section>
  );
}
