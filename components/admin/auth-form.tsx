"use client";

import { useActionState } from "react";

import type { ActionState } from "@/app/admin/actions";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

const initialState: ActionState = {};

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
};

type Props = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  description: string;
  fields: Field[];
  submitLabel: string;
};

export function AuthForm({
  action,
  title,
  description,
  fields,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
        ))}
      </div>

      <p aria-live="polite" className="min-h-5 text-sm text-rose-600">
        {state?.success === false ? state.message : ""}
      </p>

      <FormSubmitButton label={submitLabel} pendingLabel="Please wait..." />
    </form>
  );
}
