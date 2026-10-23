"use client";

import { useActionState, useEffect, useRef } from "react";
import { login, type ActionState } from "@/app/painel/actions";
import { errorClass, inputClass, primaryButtonClass } from "@/components/styles";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { status: "idle", message: "" } satisfies ActionState);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (state.status === "error") inputRef.current?.focus();
  }, [state]);
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="font-semibold">Senha do painel</label>
        <input
          ref={inputRef}
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "senha-erro" : undefined}
          className={inputClass}
        />
        {state.status === "error" && <p id="senha-erro" className={errorClass}>{state.message}</p>}
      </div>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
