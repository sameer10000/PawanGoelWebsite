import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileCta } from "@/components/site/MobileCta";
import { getSettings } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

/**
 * Rendered per request rather than at build time: the "consulting today" panel
 * is time-sensitive, and admin edits must appear immediately. Reads are local
 * SQLite queries, so the cost is negligible.
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  // Physician schema helps Google show credentials and specialty in results.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: settings.doctorName,
    medicalSpecialty: "Endocrine",
    description: settings.bioShort,
    url: siteUrl(),
    telephone: settings.primaryPhone,
    availableService: [
      "Diabetes management",
      "Thyroid disorder treatment",
      "PCOS treatment",
      "Obesity and weight management",
      "Osteoporosis treatment",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Values come from the database, not user input; JSON.stringify is sufficient here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {settings.announcementActive && settings.announcement && (
        <div className="bg-accent-500 px-4 py-2.5 text-center text-sm font-medium text-white">
          {settings.announcement}
        </div>
      )}

      <SiteHeader
        doctorName={settings.doctorName}
        qualifications={settings.qualifications}
        phone={settings.primaryPhone}
        showGallery={settings.galleryEnabled}
      />

      <main id="main" className="pb-24 sm:pb-0">
        {children}
      </main>

      <SiteFooter />

      <MobileCta
        phone={settings.primaryPhone}
        whatsapp={settings.whatsappNumber}
        doctorName={settings.doctorName}
      />
    </>
  );
}
