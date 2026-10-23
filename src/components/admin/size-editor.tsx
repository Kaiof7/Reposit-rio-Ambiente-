"use client";

import { saveSizeAction } from "@/app/painel/actions";
import { usePanelForm } from "@/components/admin/use-panel-form";
import type { CatalogSize } from "@/catalog/models";
import { errorClass, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/styles";

type SizeEditorProps = { size?: CatalogSize; disabled: boolean };

// Edits one size, or creates a new one when no size is given.
export function SizeEditor({ size, disabled }: SizeEditorProps) {
  const { state, pending, formRef, onSubmit } = usePanelForm(saveSizeAction, { resetOnSuccess: !size });
  const prefix = `tamanho-${size?.id ?? "novo"}`;
  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-foreground/15 p-4 in-[details]:rounded-none in-[details]:border-x-0 in-[details]:border-b-0">
      <input type="hidden" name="id" value={size?.id ?? ""} />
      <UncontrolledField id={`${prefix}-nome`} name="label" label="Nome" defaultValue={size?.label} placeholder="Adesivo 10 × 10 cm" error={state.errors?.label} />
      <UncontrolledField
        id={`${prefix}-descricao`}
        name="description"
        label="Descrição curta (opcional)"
        defaultValue={size?.description}
        placeholder="Para balcão, caixa ou mesa"
        error={state.errors?.description}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor={`${prefix}-formato`} className="font-semibold">Formato</label>
        <select id={`${prefix}-formato`} name="shape" defaultValue={size?.shape ?? "square"} className={inputClass}>
          <option value="square">Quadrado</option>
          <option value="portrait">Em pé (retângulo vertical)</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={disabled} aria-disabled={pending} className={size ? secondaryButtonClass : primaryButtonClass}>
          {pending ? "Salvando…" : size ? "Salvar tamanho" : "Adicionar tamanho"}
        </button>
        <p role="status" className={state.status === "error" ? errorClass : "text-sm"}>{state.message}</p>
      </div>
    </form>
  );
}

type FieldProps = { id: string; name: string; label: string; defaultValue?: string; placeholder?: string; error?: string };

// Uncontrolled input so the server action reads it straight from the form.
function UncontrolledField({ id, name, label, defaultValue, placeholder, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">{label}</label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={inputClass}
      />
      {error && <p id={`${id}-erro`} className={errorClass}>{error}</p>}
    </div>
  );
}
