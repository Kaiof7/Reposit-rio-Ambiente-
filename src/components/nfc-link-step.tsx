"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { errorClass, focusRing, inputClass, optionClass, primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { fieldErrors } from "@/order/field-errors";
import { SERVICES, SERVICE_PRICE_NOTE } from "@/catalog/services";
import {
  CREATABLE_DESTINATIONS,
  NFC_DESTINATIONS,
  nfcSchema,
  normalizeNfcUrl,
  type NfcDestination,
  type NfcField,
  type NfcInput,
} from "@/order/nfc";

const URL_LABELS: Record<NfcDestination, string> = {
  "avaliacao-google": "Link de avaliação do Google",
  site: "Endereço do site",
  instagram: "Perfil do Instagram",
  cardapio: "Link do cardápio",
  outro: "Link",
};

type NfcLinkStepProps = {
  values: NfcInput;
  onChange: (values: NfcInput) => void;
  onBack: () => void;
  onNext: () => void;
};

export function NfcLinkStep({ values, onChange, onBack, onNext }: NfcLinkStepProps) {
  const [showErrors, setShowErrors] = useState(false);
  const result = nfcSchema.safeParse(values);
  const errors = showErrors && !result.success ? fieldErrors<NfcField>(result.error) : {};
  const creatable = CREATABLE_DESTINATIONS[values.destination];
  const creating = values.needsCreation && creatable !== undefined;
  const preview = creating ? null : normalizeNfcUrl(values.url, values.destination);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    if (result.success) onNext();
    else document.getElementById("link-nfc")?.focus();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-8">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-lg font-semibold">Para onde o chip vai levar?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(NFC_DESTINATIONS) as NfcDestination[]).map((id) => (
            <label key={id} className={optionClass}>
              <input
                type="radio"
                name="destino"
                value={id}
                checked={values.destination === id}
                onChange={() => onChange({ ...values, destination: id, needsCreation: false })}
                className="size-5 accent-foreground"
              />
              {NFC_DESTINATIONS[id].label}
            </label>
          ))}
        </div>
      </fieldset>

      {creatable && (
        <div className="flex flex-col gap-2">
          <label className={optionClass}>
            <input
              id="criar-link"
              type="checkbox"
              checked={values.needsCreation}
              onChange={(event) => onChange({ ...values, needsCreation: event.target.checked })}
              className="size-5 accent-foreground"
            />
            Ainda não tenho. Quero que vocês façam.
          </label>
          {creating && (
            <div className="flex flex-col gap-1 rounded-xl bg-foreground/5 p-3 text-sm leading-relaxed">
              <span className="font-semibold">{SERVICES[creatable].label}</span>
              <span>{SERVICES[creatable].summary}</span>
              <span>
                {SERVICE_PRICE_NOTE}. Na próxima etapa você conta um pouco do negócio, e gravamos o link no chip
                quando ficar pronto.
              </span>
              {creatable === "site" && (
                <Link href="/#sites" target="_blank" className={`w-fit underline underline-offset-4 ${focusRing}`}>
                  Ver sites que já fizemos<span className="sr-only"> (abre em nova aba)</span>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {!creating && values.destination === "avaliacao-google" && (
        <details className="rounded-xl border border-foreground/20 p-3">
          <summary className={`cursor-pointer font-medium ${focusRing}`}>Como achar o link de avaliação do Google</summary>
          <ol className="mt-3 flex list-decimal flex-col gap-1 pl-5 leading-relaxed text-foreground/80">
            <li>Entre na conta Google que administra o seu negócio.</li>
            <li>Pesquise o nome do negócio no Google ou abra o app Perfil da Empresa.</li>
            <li>Toque em “Pedir avaliações” (ou “Receber mais avaliações”).</li>
            <li>Copie o link e cole aqui. Ele costuma começar com https://g.page/r/</li>
          </ol>
        </details>
      )}

      {!creating && (
        <div className="flex flex-col gap-2">
          <label htmlFor="link-nfc" className="text-lg font-semibold">{URL_LABELS[values.destination]}</label>
          <p id="link-nfc-dica" className="text-sm text-foreground/70">
            Cole o link completo. É ele que abre quando o cliente aproxima o celular.
            {values.destination === "instagram" && " Pode escrever só o @ do perfil."}
          </p>
          <input
            id="link-nfc"
            name="link"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder={NFC_DESTINATIONS[values.destination].placeholder}
            value={values.url}
            onChange={(event) => onChange({ ...values, url: event.target.value })}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={["link-nfc-dica", errors.url && "url-erro"].filter(Boolean).join(" ")}
            className={inputClass}
          />
          {errors.url && <p id="url-erro" className={errorClass}>{errors.url}</p>}
          {preview && (
            <div className="flex flex-col gap-1 rounded-xl bg-foreground/5 p-3 text-sm">
              <span>Será gravado no chip:</span>
              <code className="font-mono [overflow-wrap:anywhere]">{preview}</code>
              <a href={preview} target="_blank" rel="noopener noreferrer" className={`w-fit underline underline-offset-4 ${focusRing}`}>
                Testar link<span className="sr-only"> (abre em nova aba)</span>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-foreground/15 pt-6 sm:flex-row">
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
