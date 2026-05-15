"use client";

import { logoutAdmin } from "@/app/admin/actions";

export function LogoutButton() {
  return (
    <form action={logoutAdmin} className="w-full">
      <button
        type="submit"
        className="w-full inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400"
      >
        Sign Out
      </button>
    </form>
  );
}
