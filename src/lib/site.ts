import type { Metadata } from "next";

/**
 * The root layout appends "| <doctor name>" to every page title. Titles that
 * already name the doctor — the stored meta titles on condition pages, the
 * location pages, the about page — would carry it twice and lose their real
 * keywords to truncation in search results. Skip the template for those.
 */
export function pageTitle(title: string, doctorName: string): Metadata["title"] {
  return title.includes(doctorName) ? { absolute: title } : title;
}

/**
 * Canonical site URL — the host Google should index, and the base for canonical
 * tags, sitemap.xml and structured data.
 *
 * Production must resolve to the registered domain, never to the .vercel.app
 * deployment URL. A canonical tag pointing at vercel.app tells Google that
 * www.drpawangoel.com is a duplicate of another site, which keeps the real
 * domain out of the index.
 */
const PRODUCTION_URL = "https://www.drpawangoel.com";

/**
 * A .vercel.app deployment URL is never a valid canonical host, whatever the
 * environment says. The production env var was set to one before the domain
 * was registered, which pointed every canonical tag at the deployment URL and
 * kept the real site out of Google. Ignore such a value rather than trust it.
 */
function isDeploymentUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured && !isDeploymentUrl(configured)) return configured;

  // Preview deployments describe themselves, so links inside a preview stay in
  // that preview. They are marked noindex below.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_URL;
  return "http://localhost:3000";
}

/**
 * Only the live domain may be indexed. Previews and any stray .vercel.app
 * deployment must stay out of search results so they cannot compete with it.
 */
export function isIndexable(): boolean {
  return siteUrl() === PRODUCTION_URL;
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
