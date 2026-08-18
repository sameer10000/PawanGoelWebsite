"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV = [
  {
    heading: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/appointments", label: "Appointments" },
    ],
  },
  {
    heading: "Practice",
    items: [
      { href: "/admin/locations", label: "Locations & timings" },
      { href: "/admin/closures", label: "Leave & holidays" },
    ],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/conditions", label: "Conditions" },
      { href: "/admin/services", label: "Services" },
      { href: "/admin/credentials", label: "Credentials" },
      { href: "/admin/faqs", label: "FAQs" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/photos", label: "Photos" },
    ],
  },
  {
    heading: "Site",
    items: [
      { href: "/admin/settings", label: "Site settings" },
      { href: "/admin/account", label: "Account" },
    ],
  },
] as const;

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {ADMIN_NAV.map((group) => (
        <div key={group.heading}>
          <p className="px-3 text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">
            {group.heading}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand-600 text-white"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
