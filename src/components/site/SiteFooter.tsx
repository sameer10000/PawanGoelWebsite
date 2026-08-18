import Link from "next/link";
import { formatPhone, fullAddress, telHref } from "@/lib/format";
import { getPublishedConditions, getPublishedLocations, getSettings } from "@/lib/queries";

export async function SiteFooter() {
  const [settings, locations, conditions] = await Promise.all([
    getSettings(),
    getPublishedLocations(),
    getPublishedConditions(),
  ]);

  const primary = locations.find((l) => l.isPrimary) ?? locations[0];
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-200 bg-ink-50">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-lg font-semibold text-ink-900">
              {settings.doctorName}
            </p>
            <p className="mt-1 text-sm text-ink-500">{settings.qualifications}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              {settings.bioShort}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-900">Conditions</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {conditions.slice(0, 6).map((condition) => (
                <li key={condition.id}>
                  <Link
                    href={`/conditions/${condition.slug}`}
                    className="text-ink-600 hover:text-brand-700"
                  >
                    {condition.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/conditions"
                  className="font-medium text-brand-700 hover:underline"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-900">Consulting at</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {locations.map((location) => (
                <li key={location.id}>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="text-ink-600 hover:text-brand-700"
                  >
                    {location.name}
                    <span className="block text-xs text-ink-400">
                      {location.area}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink-900">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li>
                <a
                  href={telHref(settings.primaryPhone)}
                  className="font-medium text-ink-800 hover:text-brand-700"
                >
                  {formatPhone(settings.primaryPhone)}
                </a>
              </li>
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-brand-700"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {primary && (
                <li className="leading-relaxed">{fullAddress(primary)}</li>
              )}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <Link href="/book" className="font-medium text-brand-700 hover:underline">
                Book appointment
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-200 pt-6">
          <p className="text-xs leading-relaxed text-ink-500">
            The information on this website is provided for general awareness only
            and does not constitute medical advice, diagnosis or treatment. It is
            not a substitute for consultation with a qualified doctor. Always seek
            the advice of your physician regarding any medical condition. In an
            emergency, call your nearest hospital immediately.
          </p>
          <div className="mt-5 flex flex-col gap-3 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {settings.doctorName}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="hover:text-ink-800">
                Privacy policy
              </Link>
              <Link href="/terms" className="hover:text-ink-800">
                Terms of use
              </Link>
              <Link href="/disclaimer" className="hover:text-ink-800">
                Medical disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
