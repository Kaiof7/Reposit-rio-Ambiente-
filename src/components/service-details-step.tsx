"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SERVICES } from "@/catalog/services";
import { focusRing, optionClass, primaryButtonClass, secondaryButtonClass } from "@/components/styles";
import { TextField } from "@/components/text-field";
import { validateServiceDetails, type DetailsService, type ServiceDetailsInput } from "@/order/services";

type ServiceDetailsStepProps = {
  services: readonly DetailsService[];
  values: ServiceDetailsInput;
  onChange: (values: ServiceDetailsInput) => void;
  onBack: () => void;
  onNext: () => void;
};

const FIELD_IDS: Record<string, string> = {
  "site.businessType": "site-ramo",
  "site.content": "site-conteudo",
  "site.socialLinks": "site-redes",
  "google.category": "google-categoria",
  "google.address": "google-endereco",
};

export function ServiceDetailsStep({ services, values, onChange, onBack, onNext }: ServiceDetailsStepProps) {
  const [showErrors, setShowErrors] = useState(false);
  const allErrors = validateServiceDetails(values, services);
  const errors = showErrors ? allErrors : {};
  const site = values.site;
  const google = values.google;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    const first = Object.keys(FIELD_IDS).find((key) => allErrors[key]);
    if (!first) onNext();
    else document.getElementById(FIELD_IDS[first])?.focus();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-10">
      <p className="leading-relaxed text-foreground/80">
        Com essas informações a nossa equipe já começa. O restante combinamos pelo WhatsApp.
      </p>

      {services.includes("site") && (
        <section aria-labelledby="titulo-site" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 id="titulo-site" className="text-xl font-semibold">{SERVICES.site.label}</h3>
            <Link href="/#sites" target="_blank" className={`w-fit text-sm underline underline-offset-4 ${focusRing}`}>
              Ver sites que já fizemos<span className="sr-only"> (abre em nova aba)</span>
            </Link>
          </div>
          <TextField
            id="site-ramo"
            label="Ramo do negócio"
            placeholder="Ex.: assistência de celular, salão de beleza"
            value={site.businessType}
            onValueChange={(businessType) => onChange({ ...values, site: { ...site, businessType } })}
            error={errors["site.businessType"]}
          />
          <TextField
            id="site-conteudo"
            label="O que o site deve mostrar?"
            hint="Serviços, preços, horário de funcionamento, fotos, cardápio… Até 500 caracteres."
            multiline
            value={site.content}
            onValueChange={(content) => onChange({ ...values, site: { ...site, content } })}
            error={errors["site.content"]}
          />
          <TextField
            id="site-redes"
            label="Instagram ou outros links para colocar no site (opcional)"
            value={site.socialLinks}
            onValueChange={(socialLinks) => onChange({ ...values, site: { ...site, socialLinks } })}
            error={errors["site.socialLinks"]}
          />
        </section>
      )}

      {services.includes("google") && (
        <section aria-labelledby="titulo-google" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 id="titulo-google" className="text-xl font-semibold">{SERVICES.google.label}</h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              O Google pede uma confirmação do dono do negócio (por exemplo, código ou vídeo). A gente te
              orienta nessa parte.
            </p>
          </div>
          <TextField
            id="google-categoria"
            label="Categoria do negócio"
            placeholder="Ex.: barbearia, pizzaria, loja de roupas"
            value={google.category}
            onValueChange={(category) => onChange({ ...values, google: { ...google, category } })}
            error={errors["google.category"]}
          />
          {!google.noFixedAddress && (
            <TextField
              id="google-endereco"
              label="Endereço do negócio"
              autoComplete="street-address"
              value={google.address}
              onValueChange={(address) => onChange({ ...values, google: { ...google, address } })}
              error={errors["google.address"]}
            />
          )}
          <label className={optionClass}>
            <input
              type="checkbox"
              checked={google.noFixedAddress}
              onChange={(event) => onChange({ ...values, google: { ...google, noFixedAddress: event.target.checked } })}
              className="size-5 accent-foreground"
            />
            Atendo sem endereço fixo (em domicílio ou online)
          </label>
        </section>
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
