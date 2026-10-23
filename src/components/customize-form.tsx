"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { BACKGROUNDS, availableModels, findModel, startingPriceCents, type BackgroundId, type Catalog } from "@/catalog/models";
import { PlaqueIllustration } from "@/components/plaque-illustration";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { errorClass, inputClass, optionClass, primaryButtonClass } from "@/components/styles";
import {
  BUSINESS_NAME_MAX,
  CALL_TO_ACTION_MAX,
  DESIGNER_NOTES_MAX,
  changeModel,
  customizationSchemaFor,
  type CustomizationField,
  type CustomizationInput,
} from "@/order/customization";
import { fieldErrors } from "@/order/field-errors";
import { SERVICES, SERVICE_PRICE_NOTE } from "@/catalog/services";
import { TextField } from "@/components/text-field";

const FIELD_FOCUS_TARGET: Record<CustomizationField, string> = {
  modelId: "grupo-modelo",
  sizeId: "grupo-tamanho",
  backgroundId: "grupo-cor",
  businessName: "nome-negocio",
  callToAction: "frase",
  willSendLogo: "logo",
  artStyle: "grupo-arte",
  designerNotes: "notas-designer",
};


type CustomizeFormProps = {
  catalog: Catalog;
  values: CustomizationInput;
  onChange: (values: CustomizationInput) => void;
  onNext: () => void;
};

export function CustomizeForm({ catalog, values, onChange: update, onNext }: CustomizeFormProps) {
  const [showErrors, setShowErrors] = useState(false);

  const result = customizationSchemaFor(catalog).safeParse(values);
  const errors = showErrors && !result.success ? fieldErrors<CustomizationField>(result.error) : {};
  const model = findModel(catalog, values.modelId) ?? catalog.models[0];
  const size = model.sizes.find((candidate) => candidate.id === values.sizeId);
  const sizeInfo = size && catalog.sizes[size.id];
  const portrait = sizeInfo?.shape === "portrait";

  function text(field: "businessName" | "callToAction") {
    return (event: ChangeEvent<HTMLInputElement>) => update({ ...values, [field]: event.target.value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    if (result.success) {
      onNext();
      return;
    }
    const first = fieldErrors<CustomizationField>(result.error);
    const field = (Object.keys(FIELD_FOCUS_TARGET) as CustomizationField[]).find((key) => first[key]);
    const target = field && document.getElementById(FIELD_FOCUS_TARGET[field]);
    const focusable = target instanceof HTMLFieldSetElement ? target.querySelector("input") : target;
    focusable?.focus();
  }

  const describedBy = (field: CustomizationField, hint?: string) =>
    [hint, errors[field] && `${field}-erro`].filter(Boolean).join(" ") || undefined;
  const errorText = (field: CustomizationField) =>
    errors[field] && (
      <p id={`${field}-erro`} className={errorClass}>
        {errors[field]}
      </p>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <figure data-sticky-preview className="sticky top-0 z-10 -mx-4 flex items-center gap-4 border-b border-foreground/15 bg-background px-4 py-3 lg:order-last lg:top-8 lg:mx-0 lg:flex-col lg:border-0 lg:p-0">
        <PlaqueIllustration
          className={cn("shrink-0", portrait ? "w-24" : "w-32", "lg:w-full")}
          modelId={values.modelId}
          backgroundId={values.backgroundId}
          portrait={portrait}
          businessName={values.businessName.trim() || "Nome do seu negócio"}
          callToAction={values.callToAction.trim() || "Sua frase"}
          showLogo={values.willSendLogo}
        />
        <figcaption className="text-sm text-foreground/80">
          Prévia ilustrativa
          {sizeInfo && <span className="block">{sizeInfo.label}</span>}
        </figcaption>
      </figure>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
        <fieldset id="grupo-modelo" className="flex flex-col gap-2" aria-describedby={describedBy("modelId")}>
          <legend className="mb-2 text-lg font-semibold">Modelo</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {availableModels(catalog).map((option) => (
              <label key={option.id} className={optionClass}>
                <input
                  type="radio"
                  name="modelo"
                  value={option.id}
                  checked={values.modelId === option.id}
                  disabled={startingPriceCents(option) === null}
                  onChange={() => update(changeModel(catalog, values, option.id))}
                  className="size-5 accent-foreground"
                />
                {option.name}
                {startingPriceCents(option) === null && <span className="ml-auto text-sm">Esgotado</span>}
              </label>
            ))}
          </div>
          {errorText("modelId")}
        </fieldset>

        <fieldset id="grupo-tamanho" className="flex flex-col gap-2" aria-describedby={describedBy("sizeId")}>
          <legend className="mb-2 text-lg font-semibold">Tamanho</legend>
          {model.sizes.map((option) => (
            <label key={option.id} className={optionClass}>
              <input
                type="radio"
                name="tamanho"
                value={option.id}
                checked={values.sizeId === option.id}
                disabled={option.soldOut}
                onChange={() => update({ ...values, sizeId: option.id })}
                className="size-5 accent-foreground"
              />
              <span className="flex-1">
                <span className="block font-medium">{catalog.sizes[option.id]?.label ?? option.id}</span>
                <span className="text-sm text-foreground/70">{catalog.sizes[option.id]?.description}</span>
              </span>
              <span className="tabular-nums">{option.soldOut ? "Esgotado" : formatPrice(option.priceCents)}</span>
            </label>
          ))}
          {errorText("sizeId")}
        </fieldset>

        <fieldset id="grupo-cor" className="flex flex-col gap-2" aria-describedby={describedBy("backgroundId")}>
          <legend className="mb-2 text-lg font-semibold">Cor de fundo</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(Object.keys(BACKGROUNDS) as BackgroundId[]).map((id) => (
              <label key={id} className={optionClass}>
                <input
                  type="radio"
                  name="cor"
                  value={id}
                  checked={values.backgroundId === id}
                  onChange={() => update({ ...values, backgroundId: id })}
                  className="size-5 accent-foreground"
                />
                <span aria-hidden="true" className={cn("size-6 shrink-0 rounded-full ring-1 ring-foreground/30", BACKGROUNDS[id].className)} />
                {BACKGROUNDS[id].label}
              </label>
            ))}
          </div>
          {errorText("backgroundId")}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="nome-negocio" className="text-lg font-semibold">Nome do negócio</label>
          <p id="nome-negocio-dica" className="text-sm text-foreground/70">
            Como aparece na plaquinha. {values.businessName.trim().length}/{BUSINESS_NAME_MAX} caracteres.
          </p>
          <input
            id="nome-negocio"
            name="nomeNegocio"
            autoComplete="organization"
            value={values.businessName}
            onChange={text("businessName")}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={describedBy("businessName", "nome-negocio-dica")}
            className={inputClass}
          />
          {errorText("businessName")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="frase" className="text-lg font-semibold">Frase da plaquinha</label>
          <p id="frase-dica" className="text-sm text-foreground/70">
            Exemplo: “{model.defaultCallToAction}”. {values.callToAction.trim().length}/{CALL_TO_ACTION_MAX} caracteres.
          </p>
          <input
            id="frase"
            name="frase"
            autoComplete="off"
            value={values.callToAction}
            onChange={text("callToAction")}
            aria-invalid={Boolean(errors.callToAction)}
            aria-describedby={describedBy("callToAction", "frase-dica")}
            className={inputClass}
          />
          {errorText("callToAction")}
        </div>

        <div className="flex flex-col gap-1">
          <label className={optionClass}>
            <input
              id="logo"
              type="checkbox"
              name="logo"
              checked={values.willSendLogo}
              onChange={(event) => update({ ...values, willSendLogo: event.target.checked })}
              aria-describedby="logo-dica"
              className="size-5 accent-foreground"
            />
            Vou enviar o logo do meu negócio
          </label>
          <p id="logo-dica" className="text-sm text-foreground/70">
            Você manda o arquivo pelo WhatsApp quando finalizar o pedido.
          </p>
        </div>

        <fieldset id="grupo-arte" className="flex flex-col gap-2">
          <legend className="mb-2 text-lg font-semibold">Quem faz a arte?</legend>
          <label className={optionClass}>
            <input
              type="radio"
              name="arte"
              value="modelo"
              checked={values.artStyle === "modelo"}
              onChange={() => update({ ...values, artStyle: "modelo" })}
              className="size-5 accent-foreground"
            />
            <span>
              <span className="block font-medium">Modelo pronto</span>
              <span className="text-sm text-foreground/70">Como na prévia, ajustado pela nossa equipe</span>
            </span>
          </label>
          <label className={optionClass}>
            <input
              type="radio"
              name="arte"
              value="designer"
              checked={values.artStyle === "designer"}
              onChange={() => update({ ...values, artStyle: "designer" })}
              className="size-5 accent-foreground"
            />
            <span>
              <span className="block font-medium">{SERVICES.designer.label}</span>
              <span className="text-sm text-foreground/70">
                {SERVICES.designer.summary} {SERVICE_PRICE_NOTE}.
              </span>
            </span>
          </label>
          {values.artStyle === "designer" && (
            <TextField
              id="notas-designer"
              label="Como você imagina a arte? (opcional)"
              hint={`Cores da marca, estilo, referências. Até ${DESIGNER_NOTES_MAX} caracteres.`}
              multiline
              value={values.designerNotes}
              onValueChange={(designerNotes) => update({ ...values, designerNotes })}
              error={errors.designerNotes}
            />
          )}
        </fieldset>

        <div className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
          {size && (
            <p>
              Valor por unidade: <strong className="font-semibold">{formatPrice(size.priceCents)}</strong>
              {values.artStyle === "designer" && (
                <span className="block text-sm text-foreground/70">
                  {SERVICES.designer.label}: {SERVICE_PRICE_NOTE.toLowerCase()}.
                </span>
              )}
            </p>
          )}
          <button type="submit" className={primaryButtonClass}>
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}
