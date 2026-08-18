import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/site/Prose";
import { getPublishedServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Services & Technology",
  description:
    "Continuous glucose monitoring, insulin pump therapy, diabetes education and thyroid nodule evaluation in Delhi.",
};

export default async function ServicesPage() {
  const services = await getPublishedServices();

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Services</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Services & technology
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Diabetes technology has changed considerably in the last decade. It is
            offered here where it makes a measurable difference, and not where it
            simply adds cost.
          </p>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[0.3fr_0.7fr] lg:gap-16">
          <nav aria-label="Services" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="space-y-1 text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <a
                    href={`#${service.slug}`}
                    className="block rounded-md px-3 py-2 font-medium text-ink-600 hover:bg-ink-100 hover:text-brand-700"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {services.map((service) => (
              <section key={service.id} id={service.slug} className="scroll-mt-28">
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
                  {service.name}
                </h2>
                <p className="mt-3 text-lg text-ink-600">{service.summary}</p>
                {service.body && <Prose content={service.body} className="mt-5" />}
              </section>
            ))}

            <div className="rounded-2xl border border-ink-200 bg-ink-50 p-8">
              <h2 className="font-serif text-2xl font-semibold">
                Discuss what suits you
              </h2>
              <p className="mt-3 text-ink-600">
                Whether CGM or a pump is worth it depends on your control, budget
                and how much day-to-day involvement you want. That decision is
                made together.
              </p>
              <Link href="/book" className="btn-primary mt-6">
                Request an appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
