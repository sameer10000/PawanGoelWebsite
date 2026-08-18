import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="text-sm font-medium text-ink-500 hover:text-brand-700"
        >
          ← {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-ink-200 bg-white p-6 ${className}`}
    >
      {title && (
        <div className="mb-5">
          <h2 className="font-serif text-lg font-semibold text-ink-900">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 px-6 py-12 text-center">
      <p className="font-medium text-ink-700">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
          {description}
        </p>
      )}
    </div>
  );
}
