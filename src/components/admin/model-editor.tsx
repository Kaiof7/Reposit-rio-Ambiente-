"use client";

import { saveModelAction } from "@/app/painel/actions";
import { usePanelForm } from "@/components/admin/use-panel-form";
import { centsToInput } from "@/catalog/admin-input";
import type { CatalogModel, CatalogSize } from "@/catalog/models";
import { errorClass, focusRing, inputClass, primaryButtonClass } from "@/components/styles";
import { cn } from "@/lib/utils";

type ModelEditorProps = { model: CatalogModel; sizes: CatalogSize[]; disabled: boolean };

const checkboxClass = "size-5 accent-foreground";

export function ModelEditor({ model, sizes, disabled }: ModelEditorProps) {
  const { state, pending, formRef, onSubmit } = usePanelForm(saveModelAction);
  const headingId = `editor-${model.id}`;
  const inStock = model.sizes.filter((size) => !size.soldOut).length;
  return (
    <details className="rounded-2xl border border-foreground/15">
      <summary className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 p-4 ${focusRing}`}>
        <span className="font-semibold">{model.name}</span>
        <span className="text-sm text-foreground/70">
          {!model.available ? "Oculto" : inStock === 0 ? "Esgotado" : `${inStock} tamanho(s) à venda`}
        </span>
      </summary>
      <form ref={formRef} onSubmit={onSubmit} aria-labelledby={headingId} className="flex flex-col gap-4 border-t border-foreground/15 p-4">
        <input type="hidden" name="modelId" value={model.id} />
        <input type="hidden" name="sizeIds" value={sizes.map((size) => size.id).join(",")} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={headingId} className="text-lg font-semibold">{model.name}</h3>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" name="available" defaultChecked={model.available} className={checkboxClass} />
            Aparece na loja
          </label>
        </div>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-foreground/80">Tamanhos, preços e estoque</legend>
          {sizes.map((size) => {
            const offer = model.sizes.find((candidate) => candidate.id === size.id);
            const priceId = `preco-${model.id}-${size.id}`;
            const error = state.errors?.[size.id];
            return (
              <div key={size.id} className="grid gap-2 rounded-xl bg-foreground/5 p-3 sm:grid-cols-[1fr_9rem_auto] sm:items-center">
                <label className="flex min-h-11 items-center gap-2 font-medium">
                  <input type="checkbox" name={`offer:${size.id}`} defaultChecked={Boolean(offer)} className={checkboxClass} />
                  {size.label}
                </label>
                <div className="flex flex-col gap-1">
                  <label htmlFor={priceId} className="sr-only">Preço de {size.label} em reais</label>
                  <div className="relative">
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-foreground/70">
                      R$
                    </span>
                    <input
                      id={priceId}
                      name={`price:${size.id}`}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0,00"
                      defaultValue={offer ? centsToInput(offer.priceCents) : ""}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${priceId}-erro` : undefined}
                      className={cn(inputClass, "pl-10 tabular-nums")}
                    />
                  </div>
                </div>
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" name={`soldOut:${size.id}`} defaultChecked={offer?.soldOut} className={checkboxClass} />
                  Esgotado
                </label>
                {error && <p id={`${priceId}-erro`} className={cn(errorClass, "sm:col-span-3")}>{error}</p>}
              </div>
            );
          })}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={disabled} aria-disabled={pending} className={primaryButtonClass}>
            {pending ? "Salvando…" : `Salvar ${model.name}`}
          </button>
          <p role="status" className={state.status === "error" ? errorClass : "text-sm"}>{state.message}</p>
        </div>
      </form>
    </details>
  );
}
