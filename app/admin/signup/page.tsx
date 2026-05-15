import Link from "next/link";

import { signupAdmin } from "@/app/admin/actions";
import { AuthForm } from "@/components/admin/auth-form";

export default function AdminSignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        <section className="hidden lg:block space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Join the Team
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Become an <span className="text-blue-600">Admin</span> Today.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-lg">
              Submit your request to join the administration team. Once approved, you'll 
              gain full access to the voting management system.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                &quot;Your account will stay pending until an existing admin approves you. 
                For the first account, you can manually approve it in the database.&quot;
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <AuthForm
            action={signupAdmin}
            title="Create Admin Account"
            description="Enter your details to request administrative access."
            submitLabel="Submit Request"
            fields={[
              { name: "name", label: "Full Name", placeholder: "John Doe" },
              { name: "email", label: "Work Email", type: "email", placeholder: "john@example.com" },
              { name: "password", label: "Secure Password", type: "password", placeholder: "Min. 8 characters" },
            ]}
          />
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have a request?{" "}
            <Link href="/admin/login" className="font-bold text-blue-600 hover:text-blue-700 transition underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
