import type { InputHTMLAttributes } from "react";
import { errorClass, inputClass } from "@/components/styles";

type TextFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  value: string;
  onValueChange: (value: string) => void;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "autoComplete" | "placeholder" | "inputMode">;

// Labelled text input or textarea with hint and error wired for screen readers.
export function TextField({ id, label, hint, error, multiline, value, onValueChange, ...rest }: TextFieldProps) {
  const describedBy = [hint && `${id}-dica`, error && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    value,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    ...rest,
  };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">{label}</label>
      {hint && <p id={`${id}-dica`} className="text-sm text-foreground/70">{hint}</p>}
      {multiline ? (
        <textarea {...shared} rows={4} onChange={(event) => onValueChange(event.target.value)} className={`${inputClass} py-2`} />
      ) : (
        <input {...shared} onChange={(event) => onValueChange(event.target.value)} className={inputClass} />
      )}
      {error && <p id={`${id}-erro`} className={errorClass}>{error}</p>}
    </div>
  );
}
