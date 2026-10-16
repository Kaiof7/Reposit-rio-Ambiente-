"use client";

import { useState, type FormEvent } from "react";
import { primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { TextField } from "@/components/text-field";
import { formatPrice } from "@/lib/format";
import { NOTES_MAX, QUANTITY_MAX, customerSchema, type CustomerField, type CustomerInput } from "@/order/customer";
import { fieldErrors } from "@/order/field-errors";

type CustomerStepProps = {
  values: CustomerInput;
  unitPriceCents: number | null;
  onChange: (values: CustomerInput) => void;
  onBack: () => void;
  onNext: () => void;
};

const FIELD_IDS: Record<CustomerField, string> = {
  name: "cliente-nome",
  whatsapp: "cliente-whatsapp",
  city: "cliente-cidade",
  cep: "cliente-cep",
  quantity: "cliente-quantidade",
  notes: "cliente-observacoes",
};

export function CustomerStep({ values, unitPriceCents, onChange, onBack, onNext }: CustomerStepProps) {
  const [showErrors, setShowErrors] = useState(false);
  const result = customerSchema.safeParse(values);
  const allErrors = result.success ? {} : fieldErrors<CustomerField>(result.error);
  const errors = showErrors ? allErrors : {};
  const set = (field: CustomerField) => (value: string) => onChange({ ...values, [field]: value });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    const first = (Object.keys(FIELD_IDS) as CustomerField[]).find((field) => allErrors[field]);
    if (!first) onNext();
    else document.getElementById(FIELD_IDS[first])?.focus();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <p className="leading-relaxed text-foreground/80">
        Usamos esses dados só para combinar o pedido com você. Nada fica salvo no site.
      </p>
      <TextField id="cliente-nome" label="Seu nome" autoComplete="name" value={values.name} onValueChange={set("name")} error={errors.name} />
      <TextField
        id="cliente-whatsapp"
        label="Seu WhatsApp"
        hint="Com DDD. É por ele que vamos falar com você."
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 91234-5678"
        value={values.whatsapp}
        onValueChange={set("whatsapp")}
        error={errors.whatsapp}
      />
      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <TextField id="cliente-cidade" label="Cidade" autoComplete="address-level2" value={values.city} onValueChange={set("city")} error={errors.city} />
        <TextField
          id="cliente-cep"
          label="CEP (opcional)"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={values.cep}
          onValueChange={set("cep")}
          error={errors.cep}
        />
      </div>
      <TextField
        id="cliente-quantidade"
        label="Quantidade de plaquinhas"
        hint={
          result.success && unitPriceCents !== null
            ? `${result.data.quantity} × ${formatPrice(unitPriceCents)} = ${formatPrice(unitPriceCents * result.data.quantity)}`
            : `De 1 a ${QUANTITY_MAX}.`
        }
        inputMode="numeric"
        autoComplete="off"
        value={values.quantity}
        onValueChange={set("quantity")}
        error={errors.quantity}
      />
      <TextField
        id="cliente-observacoes"
        label="Observações (opcional)"
        hint={`Prazo, entrega, dúvidas… Até ${NOTES_MAX} caracteres.`}
        multiline
        value={values.notes}
        onValueChange={set("notes")}
        error={errors.notes}
      />
      <div className="flex flex-col-reverse gap-3 border-t border-foreground/15 pt-6 sm:flex-row">
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          Voltar
        </button>
        <button type="submit" className={primaryButtonClass}>
          Ver resumo
        </button>
      </div>
    </form>
  );
}
