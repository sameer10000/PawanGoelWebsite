import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { getSettings } from "@/lib/queries";
import { updateSettings } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Name, contact details and the text shown across the site."
      />

      <form action={updateSettings} className="space-y-6">
        <AdminCard title="Doctor details">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="doctorName" className="label">
                  Name
                </label>
                <input
                  id="doctorName"
                  name="doctorName"
                  required
                  defaultValue={settings.doctorName}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="qualifications" className="label">
                  Qualifications
                </label>
                <input
                  id="qualifications"
                  name="qualifications"
                  defaultValue={settings.qualifications}
                  className="input"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="experienceYears" className="label">
                  Years of experience
                </label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min={0}
                  defaultValue={settings.experienceYears}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="registrationNo" className="label">
                  Medical registration number
                </label>
                <input
                  id="registrationNo"
                  name="registrationNo"
                  defaultValue={settings.registrationNo ?? ""}
                  placeholder="DMC/R/12345"
                  className="input"
                />
                <p className="hint">
                  Shown on the About page. A verifiable number builds more trust
                  than any adjective.
                </p>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard
          title="Home page text"
          description="The first thing a new patient reads."
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="headline" className="label">
                Headline
              </label>
              <input
                id="headline"
                name="headline"
                defaultValue={settings.headline}
                className="input"
              />
              <p className="hint">
                Include the specialty and the area — that is what people search
                for.
              </p>
            </div>
            <div>
              <label htmlFor="subheadline" className="label">
                Sub-headline
              </label>
              <input
                id="subheadline"
                name="subheadline"
                defaultValue={settings.subheadline}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="bioShort" className="label">
                Short introduction
              </label>
              <textarea
                id="bioShort"
                name="bioShort"
                rows={3}
                defaultValue={settings.bioShort}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="bioLong" className="label">
                Full biography
              </label>
              <textarea
                id="bioLong"
                name="bioLong"
                rows={14}
                defaultValue={settings.bioLong}
                className="input font-mono text-sm"
              />
              <p className="hint">
                Shown on the About page. Blank line between paragraphs;{" "}
                <code className="rounded bg-ink-100 px-1">## </code> starts a
                heading.
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Contact details">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="primaryPhone" className="label">
                Phone
              </label>
              <input
                id="primaryPhone"
                name="primaryPhone"
                defaultValue={settings.primaryPhone}
                placeholder="+919999078196"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="whatsappNumber" className="label">
                WhatsApp number
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber}
                placeholder="919999078196"
                className="input"
              />
              <p className="hint">With country code, digits only.</p>
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email}
                className="input"
              />
              <p className="hint">Leave blank to hide it.</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard
          title="Announcement banner"
          description="A strip across the top of every page. Use it for OPD cancellations and holidays."
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="announcement" className="label">
                Message
              </label>
              <input
                id="announcement"
                name="announcement"
                defaultValue={settings.announcement ?? ""}
                placeholder="OPD closed on 15 August. Consultations resume 16 August."
                className="input"
              />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="announcementActive"
                defaultChecked={settings.announcementActive}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Show the banner
            </label>
          </div>
        </AdminCard>

        <AdminCard
          title="Clinic photo gallery"
          description="Shows clinic, equipment and team photos on the About page and on their own Gallery page. Portraits are excluded — they appear on the home and About pages already."
        >
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="galleryEnabled"
                defaultChecked={settings.galleryEnabled}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Show the gallery on the website
            </label>
            <p className="hint">
              Unticking this hides the section on the About page and removes
              &ldquo;Gallery&rdquo; from the site menu, without changing
              individual photos. The gallery is also hidden automatically when
              there are no clinic photos to show.
            </p>
            <div>
              <label htmlFor="galleryHeading" className="label">
                Section heading
              </label>
              <input
                id="galleryHeading"
                name="galleryHeading"
                defaultValue={settings.galleryHeading}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="galleryIntro" className="label">
                Short introduction
              </label>
              <textarea
                id="galleryIntro"
                name="galleryIntro"
                rows={2}
                defaultValue={settings.galleryIntro}
                placeholder="The clinic in Shalimar Bagh, with parking available on the street outside."
                className="input"
              />
              <p className="hint">Optional — leave blank to show none.</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard
          title="Search engine listing"
          description="What Google shows for the home page."
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="metaTitle" className="label">
                Search title
              </label>
              <input
                id="metaTitle"
                name="metaTitle"
                defaultValue={settings.metaTitle}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="metaDescription" className="label">
                Search description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                defaultValue={settings.metaDescription}
                className="input"
              />
            </div>
          </div>
        </AdminCard>

        <div className="sticky bottom-0 -mx-5 border-t border-ink-200 bg-white px-5 py-4 sm:-mx-8 sm:px-8">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </>
  );
}
