import type { z } from "zod";

// First message per top-level field, to show next to that field.
export function fieldErrors<Field extends string>(error: z.ZodError) {
  const errors: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message;
  }
  return errors;
}
