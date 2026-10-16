import { expect, it } from "vitest";
import { emptyServiceDetails, validateServiceDetails } from "./services";

it("validates only the requested services", () => {
  expect(validateServiceDetails(emptyServiceDetails, [])).toEqual({});
  expect(validateServiceDetails(emptyServiceDetails, ["site"])).toEqual({
    "site.businessType": "Conte qual é o ramo do negócio.",
    "site.content": "Conte o que o site deve mostrar.",
  });
});

it("requires an address unless the business has no fixed address", () => {
  const google = { category: "Barbearia", address: " ", noFixedAddress: false };
  expect(validateServiceDetails({ ...emptyServiceDetails, google }, ["google"])).toEqual({
    "google.address": "Informe o endereço ou marque que atende sem endereço fixo.",
  });
  expect(validateServiceDetails({ ...emptyServiceDetails, google: { ...google, noFixedAddress: true } }, ["google"])).toEqual({});
});

it("accepts complete site details and limits long texts", () => {
  const site = { businessType: "Assistência de celular", content: "Serviços, preços e horário", socialLinks: "" };
  expect(validateServiceDetails({ ...emptyServiceDetails, site }, ["site"])).toEqual({});
  const long = { ...site, content: "x".repeat(501) };
  expect(validateServiceDetails({ ...emptyServiceDetails, site: long }, ["site"])).toEqual({ "site.content": "Use no máximo 500 caracteres." });
});
