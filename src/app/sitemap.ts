import type { MetadataRoute } from "next";
import { getPublishedConditions, getPublishedLocations } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [conditions, locations] = await Promise.all([
    getPublishedConditions(),
    getPublishedLocations(),
  ]);

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.9 },
    { path: "/conditions", priority: 0.9 },
    { path: "/services", priority: 0.8 },
    { path: "/locations", priority: 0.9 },
    { path: "/book", priority: 0.9 },
    { path: "/faqs", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
    { path: "/disclaimer", priority: 0.2 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: new Date(),
      priority: route.priority,
    })),
    ...conditions.map((condition) => ({
      url: `${base}/conditions/${condition.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...locations.map((location) => ({
      url: `${base}/locations/${location.slug}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  ];
}
