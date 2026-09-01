/**
 * Canonical site URL. No domain is registered yet — set NEXT_PUBLIC_SITE_URL
 * once it is, and sitemap, robots and structured data pick it up automatically.
 */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/conditions", label: "Conditions" },
  { href: "/services", label: "Services" },
  { href: "/locations", label: "Locations & Timings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;
