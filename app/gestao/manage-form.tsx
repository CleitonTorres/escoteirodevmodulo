"use client";

import { startTransition, useActionState, type ReactNode } from "react";

type Result = { message?: string; error?: string };

export default function ManageForm({ action, label, children, danger }: {
  action: (previous: Result, form: FormData) => Promise<Result>;
  label: string;
  children: ReactNode;
  danger?: boolean;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return <form action={submit} className="management-form" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => submit(data));
  }}>
    <fieldset disabled={pending}>
      {children}
      <button type="submit" className={danger ? "management-danger" : "primary-btn"}>{pending ? "Salvando…" : label}</button>
    </fieldset>
    {state.error && <p role="alert">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
