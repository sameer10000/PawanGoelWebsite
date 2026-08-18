import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
      <aside className="border-b border-ink-200 bg-white lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-serif text-sm font-semibold text-white"
            >
              PG
            </span>
            <span className="text-sm font-semibold text-ink-900">
              Site admin
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium text-ink-500 hover:text-brand-700"
          >
            View site ↗
          </Link>
        </div>

        <div className="px-2 pb-5">
          <AdminNav />
        </div>

        <div className="border-t border-ink-200 p-5 lg:mt-auto">
          <p className="truncate text-xs text-ink-500">{user.email}</p>
          <form action={logout} className="mt-2">
            <button
              type="submit"
              className="text-sm font-medium text-ink-600 hover:text-red-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
