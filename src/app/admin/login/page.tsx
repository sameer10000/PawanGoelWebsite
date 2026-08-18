import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span
            aria-hidden
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 font-serif text-lg font-semibold text-white"
          >
            PG
          </span>
          <h1 className="mt-5 font-serif text-2xl font-semibold">
            Website admin
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Sign in to manage timings, content and appointments.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-ink-200 bg-white p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
