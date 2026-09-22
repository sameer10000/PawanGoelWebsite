import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma ships a native driver; keep it out of the bundler.
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    serverActions: {
      // Photo uploads are Server Action payloads and the default cap is 1 MB.
      //
      // Note this only lifts the *framework* limit. Vercel rejects request
      // bodies over roughly 4.5 MB at the edge, before the function runs, so
      // on Vercel the effective ceiling stays ~4.5 MB regardless of this
      // value. It is set high so a self-hosted deployment is not constrained.
      //
      // The real fix is in the admin upload form, which downscales images in
      // the browser before submitting — uploads land at well under 1 MB.
      bodySizeLimit: "100mb",
    },
  },
  // The .vercel.app deployment URL serves the same pages as the real domain.
  // Left alone it is a duplicate site competing with www.drpawangoel.com, so
  // send it — and any other host — to the canonical domain.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "drpawangoel.vercel.app" }],
        destination: "https://www.drpawangoel.com/:path*",
        permanent: true,
      },
    ];
  },
  // Images are served from this app's own /media/[key] route, so no external
  // hosts need allow-listing.
};

export default nextConfig;
