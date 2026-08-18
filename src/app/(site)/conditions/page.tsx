import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedConditions, getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Conditions Treated",
  description:
    "Diabetes, thyroid disorders, PCOS, obesity, osteoporosis, pituitary and adrenal conditions treated by a consultant endocrinologist in Delhi.",
};

export default async function ConditionsPage() {
  const [conditions, settings] = await Promise.all([
    getPublishedConditions(),
    getSettings(),
  ]);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-page py-14 lg:py-18">
          <p className="eyebrow">Conditions</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
            Conditions treated
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Endocrinology covers the hormone systems that regulate metabolism,
            growth, bone health and reproduction. These are the conditions{" "}
            {settings.doctorName} sees most often.
          </p>
        </div>
      </section>

      <div className="container-page py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((condition) => (
            <li key={condition.id}>
              <Link
                href={`/conditions/${condition.slug}`}
                className="group flex h-full flex-col rounded-xl border border-ink-200 p-6 transition-colors hover:border-brand-400 hover:bg-brand-50/40"
              >
                <h2 className="font-serif text-lg font-semibold group-hover:text-brand-700">
                  {condition.name}
                </h2>
                <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-ink-600">
                  {condition.summary}
                </p>
                <span className="mt-4 text-sm font-medium text-brand-700">
                  Read more →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-2xl border border-ink-200 bg-ink-50 p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold">
            Not sure which applies to you?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            Many endocrine conditions overlap, and symptoms like fatigue or weight
            change can point in several directions. A consultation will clarify
            what needs investigating.
          </p>
          <Link href="/book" className="btn-primary mt-6">
            Request an appointment
          </Link>
        </div>
      </div>
    </>
  );
}
