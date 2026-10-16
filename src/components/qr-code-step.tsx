"use client";

import { useState, type FormEvent } from "react";
import { SERVICES, SERVICE_PRICE_NOTE } from "@/catalog/services";
import { QrPreview } from "@/components/qr-preview";
import { optionClass, primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { TextField } from "@/components/text-field";
import { PIX_CITY_MAX, PIX_KEY_TYPES, PIX_NAME_MAX, type PixKeyType } from "@/order/pix";
import { qrErrors, qrSchema, type QrInput } from "@/order/qr";
import type { DetailsService } from "@/order/services";

// What the NFC chip will open, to offer "same link as the chip".
export type ChipTarget = { url: string } | { creation: DetailsService } | null;

type QrCodeStepProps = {
  values: QrInput;
  chip: ChipTarget;
  onChange: (values: QrInput) => void;
  onBack: () => void;
  onNext: () => void;
};

const CREATED_LINK_LABELS: Record<DetailsService, string> = {
  site: "O site que vamos fazer",
  google: "A avaliação do Google que vamos cadastrar",
};

const FIELD_IDS: Record<string, string> = {
  "pix.key": "pix-chave",
  "pix.name": "pix-nome",
  "pix.city": "pix-cidade",
  "link.url": "qr-link",
};

export function QrCodeStep({ values, chip, onChange, onBack, onNext }: QrCodeStepProps) {
  const [showErrors, setShowErrors] = useState(false);
  const result = qrSchema.safeParse(values);
  const allErrors = result.success ? {} : qrErrors(result.error);
  const errors = showErrors ? allErrors : {};
  const { pix, link } = values;
  const content = result.success ? result.data : null;

  const previewText =
    content?.mode === "pix" ? content.payload
    : content?.mode === "link" && content.source === "outro" ? content.url
    : content?.mode === "link" && chip && "url" in chip ? chip.url
    : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    const first = Object.keys(FIELD_IDS).find((key) => allErrors[key]);
    if (!first) onNext();
    else document.getElementById(FIELD_IDS[first])?.focus();
  }

  const radio = (name: string, checked: boolean, onSelect: () => void) => (
    <input type="radio" name={name} checked={checked} onChange={onSelect} className="size-5 accent-foreground" />
  );

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_16rem] lg:items-start">
      <div className="flex max-w-2xl flex-col gap-8 lg:col-start-1">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-lg font-semibold">Quer um QR code impresso na plaquinha?</legend>
          <p className="mb-1 text-sm text-foreground/70">Bom para quem tem celular sem NFC: é só apontar a câmera.</p>
          <label className={optionClass}>
            {radio("qr", values.mode === "nenhum", () => onChange({ ...values, mode: "nenhum" }))}
            Não, só o chip
          </label>
          <label className={optionClass}>
            {radio("qr", values.mode === "pix", () => onChange({ ...values, mode: "pix" }))}
            Sim, QR code do Pix
          </label>
          <label className={optionClass}>
            {radio("qr", values.mode === "link", () => onChange({ ...values, mode: "link" }))}
            Sim, QR code de um link
          </label>
        </fieldset>

        {values.mode === "pix" && (
          <div className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-semibold">Tipo da chave Pix</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(PIX_KEY_TYPES) as PixKeyType[]).map((type) => (
                  <label key={type} className={optionClass}>
                    {radio("tipo-chave", pix.keyType === type, () => onChange({ ...values, pix: { ...pix, keyType: type } }))}
                    {PIX_KEY_TYPES[type].label}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextField
              id="pix-chave"
              label="Chave Pix"
              placeholder={PIX_KEY_TYPES[pix.keyType].placeholder}
              inputMode={PIX_KEY_TYPES[pix.keyType].inputMode}
              autoComplete="off"
              value={pix.key}
              onValueChange={(key) => onChange({ ...values, pix: { ...pix, key } })}
              error={errors["pix.key"]}
            />
            <TextField
              id="pix-nome"
              label="Nome de quem recebe"
              hint={`Como aparece no app do banco. Até ${PIX_NAME_MAX} caracteres.`}
              autoComplete="name"
              value={pix.name}
              onValueChange={(name) => onChange({ ...values, pix: { ...pix, name } })}
              error={errors["pix.name"]}
            />
            <TextField
              id="pix-cidade"
              label="Cidade de quem recebe"
              hint={`Exigida pelo padrão do Pix. Até ${PIX_CITY_MAX} caracteres.`}
              autoComplete="address-level2"
              value={pix.city}
              onValueChange={(city) => onChange({ ...values, pix: { ...pix, city } })}
              error={errors["pix.city"]}
            />
            <p className="text-sm leading-relaxed text-foreground/70">
              O QR code não tem valor fixo: quem paga digita o valor. Seus dados não ficam salvos no site; vão só na
              mensagem do pedido.
            </p>
          </div>
        )}

        {values.mode === "link" && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 font-semibold">Para onde o QR code leva?</legend>
            <label className={optionClass}>
              {radio("qr-destino", link.source === "chip", () => onChange({ ...values, link: { ...link, source: "chip" } }))}
              <span>
                <span className="block">O mesmo link do chip</span>
                {chip && (
                  <span className="text-sm text-foreground/70 [overflow-wrap:anywhere]">
                    {"url" in chip ? chip.url : CREATED_LINK_LABELS[chip.creation]}
                  </span>
                )}
              </span>
            </label>
            <label className={optionClass}>
              {radio("qr-destino", link.source === "outro", () => onChange({ ...values, link: { ...link, source: "outro" } }))}
              Outro link
            </label>
            {link.source === "outro" && (
              <div className="mt-4 flex flex-col gap-4">
                <label className={optionClass}>
                  <input
                    type="checkbox"
                    checked={link.needsCreation}
                    onChange={(event) => onChange({ ...values, link: { ...link, needsCreation: event.target.checked } })}
                    className="size-5 accent-foreground"
                  />
                  Ainda não tenho. Quero que vocês façam um site.
                </label>
                {link.needsCreation ? (
                  <p className="rounded-xl bg-foreground/5 p-3 text-sm leading-relaxed">
                    {SERVICES.site.summary} {SERVICE_PRICE_NOTE}.
                  </p>
                ) : (
                  <TextField
                    id="qr-link"
                    label="Link do QR code"
                    placeholder="https://..."
                    inputMode="url"
                    autoComplete="url"
                    value={link.url}
                    onValueChange={(url) => onChange({ ...values, link: { ...link, url } })}
                    error={errors["link.url"]}
                  />
                )}
              </div>
            )}
          </fieldset>
        )}

      </div>

      {values.mode !== "nenhum" && (
        <figure className="flex w-48 flex-col gap-2 lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-full">
          {previewText ? (
            <QrPreview text={previewText} label={values.mode === "pix" ? "Prévia do QR code do Pix" : "Prévia do QR code do link"} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-foreground/30 p-4 text-center text-sm text-foreground/70">
              {values.mode === "pix" ? "Preencha a chave, o nome e a cidade para ver o QR code." : "O QR code aparece quando o link estiver pronto."}
            </div>
          )}
          <figcaption className="text-sm text-foreground/80">Prévia. Teste com a câmera do celular; a arte final é feita pela nossa equipe.</figcaption>
        </figure>
      )}

      <div className="flex max-w-2xl flex-col-reverse gap-3 border-t border-foreground/15 pt-6 sm:flex-row lg:col-start-1">
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          Voltar
        </button>
        <button type="submit" className={primaryButtonClass}>
          Continuar
        </button>
      </div>
    </form>
  );
}
