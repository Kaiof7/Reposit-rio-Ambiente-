import { expect, it } from "vitest";
import { assembleOrder, type OrderInputs } from "./assemble";
import { DEFAULT_CATALOG } from "@/catalog/models";
import { initialCustomization } from "./customization";
import { emptyCustomer } from "./customer";
import { initialQr } from "./qr";
import { emptyServiceDetails } from "./services";

const inputs: OrderInputs = {
  customization: { ...initialCustomization(DEFAULT_CATALOG, "instagram"), businessName: "Studio Bela" },
  nfc: { destination: "instagram", url: "@studiobela", needsCreation: false },
  qr: initialQr,
  serviceDetails: emptyServiceDetails,
  customer: { ...emptyCustomer, name: "Bela", whatsapp: "11912345678", city: "Recife" },
};

it("assembles the validated order from every step", () => {
  const order = assembleOrder(DEFAULT_CATALOG, inputs, []);
  expect(order?.nfc.url).toBe("https://www.instagram.com/studiobela/");
  expect(order?.customer.quantity).toBe(1);
  expect(order?.services).toEqual({ site: undefined, google: undefined });
});

it("returns null when any step or requested service is incomplete", () => {
  expect(assembleOrder(DEFAULT_CATALOG, { ...inputs, customer: emptyCustomer }, [])).toBeNull();
  expect(assembleOrder(DEFAULT_CATALOG, inputs, ["site"])).toBeNull();
});

it("keeps details only for requested services", () => {
  const serviceDetails = { ...emptyServiceDetails, site: { businessType: "Salão", content: "Serviços", socialLinks: "" } };
  const order = assembleOrder(DEFAULT_CATALOG, { ...inputs, serviceDetails }, ["site"]);
  expect(order?.services.site?.businessType).toBe("Salão");
  expect(order?.services.google).toBeUndefined();
});
