"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { BACKGROUNDS, MODELS, SIZES, type BackgroundId, type ModelId } from "@/catalog/models";
import { PlaqueIllustration } from "@/components/plaque-illustration";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BUSINESS_NAME_MAX,
  CALL_TO_ACTION_MAX,
  changeModel,
  customizationSchema,
  fieldErrors,
  initialCustomization,
  type CustomizationField,
  type CustomizationInput,
} from "@/order/customization";

const FIELD_FOCUS_TARGET: Record<CustomizationField, string> = {
  modelId: "grupo-modelo",
  sizeId: "grupo-tamanho",
  backgroundId: "grupo-cor",
  businessName: "nome-negocio",
  callToAction: "frase",
  willSendLogo: "logo",
};

const optionClass =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-foreground/20 px-3 py-2 has-checked:border-foreground has-checked:bg-foreground/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground";
const inputClass =
  "min-h-11 w-full rounded-xl border border-foreground/30 bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground aria-invalid:border-red-600";

export function CustomizeForm({ initialModelId }: { initialModelId: ModelId }) {
  const [values, setValues] = useState<CustomizationInput>(() => initialCustomization(initialModelId));
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(false);

  const result = customizationSchema.safeParse(values);
  const errors = showErrors && !result.success ? fieldErrors(result.error) : {};
  const model = MODELS.find((candidate) => candidate.id === values.modelId) ?? MODELS[0];
  const size = model.sizes.find((candidate) => candidate.id === values.sizeId);

  function update(next: CustomizationInput) {
    setValues(next);
    setDone(false);
  }

  function text(field: "businessName" | "callToAction") {
    return (event: ChangeEvent<HTMLInputElement>) => update({ ...values, [field]: event.target.value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    if (result.success) {
      setDone(true);
      return;
    }
    const first = fieldErrors(result.error);
    const field = (Object.keys(FIELD_FOCUS_TARGET) as CustomizationField[]).find((key) => first[key]);
    const target = field && document.getElementById(FIELD_FOCUS_TARGET[field]);
    const focusable = target instanceof HTMLFieldSetElement ? target.querySelector("input") : target;
    focusable?.focus();
  }

  const describedBy = (field: CustomizationField, hint?: string) =>
    [hint, errors[field] && `${field}-erro`].filter(Boolean).join(" ") || undefined;
  const errorText = (field: CustomizationField) =>
    errors[field] && (
      <p id={`${field}-erro`} className="text-sm font-medium text-red-700 dark:text-red-400">
        {errors[field]}
      </p>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <figure className="sticky top-0 z-10 -mx-4 flex items-center gap-4 border-b border-foreground/15 bg-background px-4 py-3 lg:order-last lg:top-8 lg:mx-0 lg:flex-col lg:border-0 lg:p-0">
        <PlaqueIllustration
          className={cn("shrink-0", SIZES[values.sizeId as keyof typeof SIZES]?.shape === "portrait" ? "w-24" : "w-32", "lg:w-full")}
          modelId={values.modelId}
          backgroundId={values.backgroundId}
          sizeId={size?.id}
          businessName={values.businessName.trim() || "Nome do seu negócio"}
          callToAction={values.callToAction.trim() || "Sua frase"}
          showLogo={values.willSendLogo}
        />
        <figcaption className="text-sm text-foreground/80">
          Prévia ilustrativa
          {size && <span className="block">{SIZES[size.id].label}</span>}
        </figcaption>
      </figure>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
        <fieldset id="grupo-modelo" className="flex flex-col gap-2" aria-describedby={describedBy("modelId")}>
          <legend className="mb-2 text-lg font-semibold">Modelo</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODELS.map((option) => (
              <label key={option.id} className={optionClass}>
                <input
                  type="radio"
                  name="modelo"
                  value={option.id}
                  checked={values.modelId === option.id}
                  onChange={() => update(changeModel(values, option.id))}
                  className="size-5 accent-foreground"
                />
                {option.name}
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
                onChange={() => update({ ...values, sizeId: option.id })}
                className="size-5 accent-foreground"
              />
              <span className="flex-1">
                <span className="block font-medium">{SIZES[option.id].label}</span>
                <span className="text-sm text-foreground/70">{SIZES[option.id].description}</span>
              </span>
              <span className="tabular-nums">{formatPrice(option.priceCents)}</span>
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

        <div className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
          {size && (
            <p>
              Valor por unidade: <strong className="font-semibold">{formatPrice(size.priceCents)}</strong>
            </p>
          )}
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-fit"
          >
            Continuar
          </button>
          <p role="status" className="text-sm">
            {done && "Personalização pronta. A próxima etapa, o link gravado no chip, chega em breve."}
          </p>
        </div>
      </form>
    </div>
  );
}
