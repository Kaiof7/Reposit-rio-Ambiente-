// Shared Tailwind class strings for the order form controls.
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export const optionClass =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-foreground/20 px-3 py-2 has-checked:border-foreground has-checked:bg-foreground/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground";

export const inputClass = `min-h-11 w-full rounded-xl border border-foreground/30 bg-background px-3 text-base ${focusRing} aria-invalid:border-red-600`;

export const errorClass = "text-sm font-medium text-red-700 dark:text-red-400";

export const primaryButtonClass = `inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background ${focusRing} sm:w-fit`;

export const secondaryButtonClass = `inline-flex min-h-11 items-center justify-center rounded-full border border-foreground/30 px-6 font-medium ${focusRing} sm:w-fit`;
