import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/site/Prose";
import {
  getConditionBySlug,
  getPublishedConditions,
  getSettings,
} from "@/lib/queries";
import { splitLines, whatsappHref } from "@/lib/format";
import { pageTitle } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [condition, settings] = await Promise.all([
    getConditionBySlug(slug),
    getSettings(),
  ]);
  if (!condition) return {};
  return {
    title: pageTitle(condition.metaTitle || condition.name, settings.doctorName),
    description: condition.metaDescription || condition.summary,
    alternates: { canonical: `/conditions/${condition.slug}` },
  };
}

export default async function ConditionPage({ params }: Params) {
  const { slug } = await params;
  const [condition, settings, allConditions] = await Promise.all([
    getConditionBySlug(slug),
    getSettings(),
    getPublishedConditions(),
  ]);

  if (!condition) notFound();

  const symptoms = splitLines(condition.symptoms);
  const whenToSee = splitLines(condition.whenToSee);
  const related = allConditions
    .filter((c) => c.id !== condition.id)
    .slice(0, 4);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
            <Link href="/conditions" className="hover:text-brand-700">
              Conditions
            </Link>
            <span aria-hidden> / </span>
            <span className="text-ink-700">{condition.name}</span>
          </nav>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            {condition.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            {condition.summary}
          </p>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
        <article>
          <Prose content={condition.body} />

          {condition.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="font-serif text-2xl font-semibold">
                Questions about {condition.name.toLowerCase()}
              </h2>
              <div className="mt-5 divide-y divide-ink-200 border-y border-ink-200">
                {condition.faqs.map((faq) => (
                  <details key={faq.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900">
                      {faq.question}
                      <span
                        aria-hidden
                        className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-14">
              <h2 className="font-serif text-2xl font-semibold">
                Related conditions
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/conditions/${item.slug}`}
                      className="block rounded-lg border border-ink-200 px-4 py-3 text-[15px] font-medium text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {symptoms.length > 0 && (
            <div className="card bg-ink-50">
              <h2 className="font-serif text-lg font-semibold">
                Common symptoms
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] text-ink-700">
                {symptoms.map((symptom) => (
                  <li key={symptom} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {whenToSee.length > 0 && (
            <div className="card border-brand-200 bg-brand-50">
              <h2 className="font-serif text-lg font-semibold">
                When to see an endocrinologist
              </h2>
              <ul className="mt-3 space-y-2 text-[15px] text-ink-700">
                {whenToSee.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h2 className="font-serif text-lg font-semibold">Book a consultation</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Bring any previous reports — even older ones are useful.
            </p>
            <Link href="/book" className="btn-primary mt-4 w-full">
              Request an appointment
            </Link>
            <a
              href={whatsappHref(
                settings.whatsappNumber,
                `Hello, I would like to consult regarding ${condition.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-2.5 w-full"
            >
              Ask on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
