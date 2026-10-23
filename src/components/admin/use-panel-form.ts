"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import type { ActionState } from "@/app/painel/actions";

type PanelAction = (state: ActionState, form: FormData) => Promise<ActionState>;

// Submits through onSubmit instead of <form action>, because React resets
// uncontrolled fields after every action and would wipe the seller's edits
// when validation fails. Moves focus to the first invalid field on error.
export function usePanelForm(action: PanelAction, { resetOnSuccess = false } = {}) {
  const [state, dispatch, pending] = useActionState(action, { status: "idle", message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    if (state.status === "error") {
      form.querySelector<HTMLElement>('[aria-invalid="true"], [type="submit"]')?.focus();
    } else if (state.status === "ok" && resetOnSuccess) {
      form.reset();
    }
  }, [state, resetOnSuccess]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  }

  return { state, pending, formRef, onSubmit };
}
