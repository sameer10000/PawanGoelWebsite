import type { Metadata } from "next";
import Link from "next/link";
import { getConditionFaqs, getGeneralFaqs } from "@/lib/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/faqs" },
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about consultations, reports, fasting for tests, follow-up and online consultation.",
};

export default async function FaqsPage() {
  const [general, conditionFaqs] = await Promise.all([
    getGeneralFaqs(),
    getConditionFaqs(),
  ]);

  const grouped = new Map<string, { name: string; slug: string; faqs: typeof conditionFaqs }>();
  for (const faq of conditionFaqs) {
    if (!faq.condition || !faq.condition.published) continue;
    const key = faq.condition.slug;
    const existing = grouped.get(key);
    if (existing) existing.faqs.push(faq);
    else
      grouped.set(key, {
        name: faq.condition.name,
        slug: faq.condition.slug,
        faqs: [faq],
      });
  }

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Help</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Frequently asked questions
          </h1>
        </div>
      </section>

      <div className="container-prose py-14">
        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {general.map((faq) => (
            <details key={faq.id} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-ink-900">
                {faq.question}
                <span
                  aria-hidden
                  className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-ink-600">{faq.answer}</p>
            </details>
          ))}
        </div>

        {[...grouped.values()].map((group) => (
          <section key={group.slug} className="mt-12">
            <h2 className="font-serif text-2xl font-semibold">
              <Link
                href={`/conditions/${group.slug}`}
                className="hover:text-brand-700"
              >
                {group.name}
              </Link>
            </h2>
            <div className="mt-4 divide-y divide-ink-200 border-y border-ink-200">
              {group.faqs.map((faq) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-ink-900">
                    {faq.question}
                    <span
                      aria-hidden
                      className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 rounded-2xl border border-ink-200 bg-ink-50 p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold">
            Still have a question?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-600">
            The clinic is happy to answer scheduling and process questions before
            you book. Clinical questions are best answered in consultation.
          </p>
          <Link href="/contact" className="btn-primary mt-6">
            Contact the clinic
          </Link>
        </div>
      </div>
    </>
  );
}
