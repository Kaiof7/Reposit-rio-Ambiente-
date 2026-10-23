import { z } from "zod";
import { BACKGROUNDS, MODELS, availableModels, findModel, orderableSizes, type BackgroundId, type Catalog, type ModelId } from "@/catalog/models";

export const BUSINESS_NAME_MAX = 40;
export const CALL_TO_ACTION_MAX = 30;
export const DESIGNER_NOTES_MAX = 500;

const modelIds = MODELS.map((model) => model.id) as [ModelId, ...ModelId[]];
const backgroundIds = Object.keys(BACKGROUNDS) as [BackgroundId, ...BackgroundId[]];

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${field}.`)
    .max(max, `Use no máximo ${max} caracteres.`);

const baseSchema = z.object({
  modelId: z.enum(modelIds, "Escolha um modelo."),
  sizeId: z.string(),
  backgroundId: z.enum(backgroundIds, "Escolha uma cor de fundo."),
  businessName: requiredText("o nome do negócio", BUSINESS_NAME_MAX),
  callToAction: requiredText("a frase da plaquinha", CALL_TO_ACTION_MAX),
  willSendLogo: z.boolean(),
  // "designer": a media professional makes the art by hand (extra service);
  // the choices above still guide them.
  artStyle: z.enum(["modelo", "designer"]),
  designerNotes: z.string().trim().max(DESIGNER_NOTES_MAX, `Use no máximo ${DESIGNER_NOTES_MAX} caracteres.`),
});

// Availability, offered sizes and "esgotado" come from the current catalog.
export function customizationSchemaFor(catalog: Catalog) {
  return baseSchema.superRefine((value, ctx) => {
    const model = findModel(catalog, value.modelId);
    if (!model) return;
    if (!model.available) {
      ctx.addIssue({ code: "custom", path: ["modelId"], message: "Este modelo não está disponível no momento." });
      return;
    }
    const size = model.sizes.find((candidate) => candidate.id === value.sizeId);
    if (!size) {
      ctx.addIssue({ code: "custom", path: ["sizeId"], message: "Escolha um tamanho disponível para este modelo." });
    } else if (size.soldOut) {
      ctx.addIssue({ code: "custom", path: ["sizeId"], message: "Este tamanho está esgotado. Escolha outro." });
    }
  });
}

export type CustomizationInput = z.input<typeof baseSchema>;
export type Customization = z.output<typeof baseSchema>;
export type CustomizationField = keyof CustomizationInput;

export function initialCustomization(catalog: Catalog, modelId: ModelId): CustomizationInput {
  const model = availableModels(catalog).find((candidate) => candidate.id === modelId) ?? availableModels(catalog)[0] ?? catalog.models[0];
  return {
    modelId: model.id,
    sizeId: (orderableSizes(model)[0] ?? model.sizes[0])?.id ?? "",
    backgroundId: model.defaultBackgroundId,
    businessName: "",
    callToAction: model.defaultCallToAction,
    willSendLogo: false,
    artStyle: "modelo",
    designerNotes: "",
  };
}

// Switching models keeps what the customer typed, but follows the new
// model's defaults where the customer had not changed them yet.
export function changeModel(catalog: Catalog, current: CustomizationInput, modelId: ModelId): CustomizationInput {
  const previous = findModel(catalog, current.modelId);
  const next = findModel(catalog, modelId) ?? catalog.models[0];
  const orderable = orderableSizes(next);
  const keepsSize = orderable.some((size) => size.id === current.sizeId);
  return {
    ...current,
    modelId: next.id,
    sizeId: keepsSize ? current.sizeId : (orderable[0] ?? next.sizes[0])?.id ?? "",
    backgroundId: current.backgroundId === previous?.defaultBackgroundId ? next.defaultBackgroundId : current.backgroundId,
    callToAction: current.callToAction === previous?.defaultCallToAction ? next.defaultCallToAction : current.callToAction,
  };
}
