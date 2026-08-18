import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma ships a native driver; keep it out of the bundler.
  serverExternalPackages: ["@prisma/client"],
  // Images are served from this app's own /media/[key] route, so no external
  // hosts need allow-listing.
};

export default nextConfig;
