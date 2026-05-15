import Link from "next/link";

import { loginAdmin } from "@/app/admin/actions";
import { AuthForm } from "@/components/admin/auth-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        <section className="hidden lg:block space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Admin Portal
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Control your <span className="text-blue-600">Voting</span> Ecosystem.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-lg">
              Monitor live payments, manage participants, and oversee categories from a single, 
              secure dashboard designed for scale.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Real-time Analytics",
              "Payment Tracking",
              "Category Control",
              "Admin Approvals"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <AuthForm
            action={loginAdmin}
            title="Welcome back"
            description="Enter your credentials to access the admin dashboard."
            submitLabel="Sign In"
            fields={[
              { name: "email", label: "Email Address", type: "email", placeholder: "admin@example.com" },
              { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
            ]}
          />
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/admin/signup" className="font-bold text-blue-600 hover:text-blue-700 transition underline underline-offset-4">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
