import { z } from "zod";
import { BACKGROUNDS, MODELS, type BackgroundId, type ModelId } from "@/catalog/models";

export const BUSINESS_NAME_MAX = 40;
export const CALL_TO_ACTION_MAX = 30;

const modelIds = MODELS.map((model) => model.id) as [ModelId, ...ModelId[]];
const backgroundIds = Object.keys(BACKGROUNDS) as [BackgroundId, ...BackgroundId[]];

const requiredText = (field: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${field}.`)
    .max(max, `Use no máximo ${max} caracteres.`);

export const customizationSchema = z
  .object({
    modelId: z.enum(modelIds, "Escolha um modelo."),
    sizeId: z.string(),
    backgroundId: z.enum(backgroundIds, "Escolha uma cor de fundo."),
    businessName: requiredText("o nome do negócio", BUSINESS_NAME_MAX),
    callToAction: requiredText("a frase da plaquinha", CALL_TO_ACTION_MAX),
    willSendLogo: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const model = MODELS.find((candidate) => candidate.id === value.modelId);
    if (model && !model.sizes.some((size) => size.id === value.sizeId)) {
      ctx.addIssue({ code: "custom", path: ["sizeId"], message: "Escolha um tamanho disponível para este modelo." });
    }
  });

export type CustomizationInput = z.input<typeof customizationSchema>;
export type Customization = z.output<typeof customizationSchema>;
export type CustomizationField = keyof CustomizationInput;

export function initialCustomization(modelId: ModelId): CustomizationInput {
  const model = MODELS.find((candidate) => candidate.id === modelId) ?? MODELS[0];
  return {
    modelId: model.id,
    sizeId: model.sizes[0].id,
    backgroundId: model.defaultBackgroundId,
    businessName: "",
    callToAction: model.defaultCallToAction,
    willSendLogo: false,
  };
}

// Switching models keeps what the customer typed, but follows the new
// model's defaults where the customer had not changed them yet.
export function changeModel(current: CustomizationInput, modelId: ModelId): CustomizationInput {
  const previous = MODELS.find((model) => model.id === current.modelId);
  const next = MODELS.find((model) => model.id === modelId) ?? MODELS[0];
  const keepsSize = next.sizes.some((size) => size.id === current.sizeId);
  return {
    ...current,
    modelId: next.id,
    sizeId: keepsSize ? current.sizeId : next.sizes[0].id,
    backgroundId: current.backgroundId === previous?.defaultBackgroundId ? next.defaultBackgroundId : current.backgroundId,
    callToAction: current.callToAction === previous?.defaultCallToAction ? next.defaultCallToAction : current.callToAction,
  };
}

export function fieldErrors(error: z.ZodError<CustomizationInput>) {
  const errors: Partial<Record<CustomizationField, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as CustomizationField;
    errors[field] ??= issue.message;
  }
  return errors;
}
