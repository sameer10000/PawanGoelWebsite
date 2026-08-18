import Link from "next/link";
import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { createCondition, toggleConditionPublished } from "./actions";

export default async function AdminConditionsPage() {
  const conditions = await prisma.condition.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { faqs: true } } },
  });

  return (
    <>
      <PageHeader
        title="Conditions"
        description="Each condition is its own page and its own entry in search results. These pages are how most new patients will find the site."
      />

      <ul className="space-y-3">
        {conditions.map((condition) => (
          <li
            key={condition.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-ink-200 bg-white p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-lg font-semibold text-ink-900">
                  <Link
                    href={`/admin/conditions/${condition.id}`}
                    className="hover:text-brand-700"
                  >
                    {condition.name}
                  </Link>
                </h2>
                {condition.featured && (
                  <span className="badge bg-brand-100 text-brand-800">
                    On home page
                  </span>
                )}
                <span
                  className={`badge ${
                    condition.published
                      ? "bg-green-100 text-green-800"
                      : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {condition.published ? "Live" : "Draft"}
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-ink-600">
                {condition.summary}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                /conditions/{condition.slug}
                {condition._count.faqs > 0
                  ? ` · ${condition._count.faqs} FAQ${condition._count.faqs > 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={`/admin/conditions/${condition.id}`}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Edit
              </Link>
              <form action={toggleConditionPublished}>
                <input type="hidden" name="id" value={condition.id} />
                <SubmitButton className="btn-ghost px-3 py-2 text-sm" pendingLabel="…">
                  {condition.published ? "Unpublish" : "Publish"}
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <AdminCard
        title="Add a condition"
        description="Creates a draft page. Add the detail on the next screen, then publish."
        className="mt-8"
      >
        <form action={createCondition} className="space-y-5">
          <div>
            <label htmlFor="name" className="label">
              Condition name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Gestational Diabetes"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="summary" className="label">
              One-line summary <span className="text-red-600">*</span>
            </label>
            <input
              id="summary"
              name="summary"
              required
              placeholder="Blood sugar management during pregnancy, with monitoring for mother and baby."
              className="input"
            />
            <p className="hint">
              Shown on cards and used as the search-result description.
            </p>
          </div>
          <SubmitButton pendingLabel="Creating…">Create draft</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
