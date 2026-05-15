"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { createCategoryAction, type ActionState } from "@/app/admin/actions";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

const initialState: ActionState = {};

export function CreateCategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, onSuccess]);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 shadow-sm"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          New Category
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a new voting group. Slugs are generated automatically.
        </p>
      </div>

      <div className="space-y-6">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Category Name
          </span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="e.g. Best Student"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </span>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            placeholder="Optional context for voters..."
          />
        </label>
      </div>

      <p
        aria-live="polite"
        className={`min-h-5 text-sm font-medium ${state?.success ? "text-emerald-600" : "text-rose-600"}`}
      >
        {state?.message ?? ""}
      </p>

      <FormSubmitButton label="Create Category" pendingLabel="Creating..." />
    </form>
  );
}
