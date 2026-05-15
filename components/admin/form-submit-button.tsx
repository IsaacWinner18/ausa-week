"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type Props = {
  label: string;
  pendingLabel?: string;
  isPending?: boolean;
  className?: string;
};

export function FormSubmitButton({
  label,
  pendingLabel,
  isPending,
  className,
}: Props) {
  const { pending } = useFormStatus();
  const active = isPending ?? pending;

  return (
    <button
      type="submit"
      disabled={active}
      className={`relative w-full inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 ${className || ""}`}
    >
      {active ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel ?? "Please wait..."}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
