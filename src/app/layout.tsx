import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { getSettings } from "@/lib/queries";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: settings.metaTitle,
      template: `%s | ${settings.doctorName}`,
    },
    description: settings.metaDescription,
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      type: "website",
      locale: "en_IN",
      siteName: settings.doctorName,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
