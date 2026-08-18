"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { formatPhone, telHref } from "@/lib/format";

type Props = {
  doctorName: string;
  qualifications: string;
  phone: string;
};

export function SiteHeader({ doctorName, qualifications, phone }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-serif text-lg font-semibold text-white"
          >
            PG
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-base leading-tight font-semibold text-ink-900 sm:text-lg">
              {doctorName}
            </span>
            <span className="hidden truncate text-xs text-ink-500 sm:block">
              {qualifications}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-700"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref(phone)}
            className="hidden text-sm font-semibold text-ink-800 hover:text-brand-700 xl:block"
          >
            {formatPhone(phone)}
          </a>
          <Link href="/book" className="btn-primary hidden px-4 py-2.5 sm:inline-flex">
            Book appointment
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-md p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-ink-200 bg-white lg:hidden">
          <div className="container-page py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-2 py-3 text-[15px] font-medium text-ink-700 hover:bg-ink-100"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary mt-3 w-full">
              Book appointment
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
