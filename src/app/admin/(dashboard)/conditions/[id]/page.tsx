import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { deleteCondition, updateCondition } from "../actions";

export default async function EditConditionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const condition = await prisma.condition.findUnique({
    where: { id: Number(id) },
    include: { faqs: { orderBy: { sortOrder: "asc" } } },
  });

  if (!condition) notFound();

  return (
    <>
      <PageHeader
        title={condition.name}
        description={`/conditions/${condition.slug}`}
        back={{ href: "/admin/conditions", label: "All conditions" }}
        action={
          condition.published ? (
            <Link
              href={`/conditions/${condition.slug}`}
              target="_blank"
              className="btn-secondary px-4 py-2 text-sm"
            >
              View page ↗
            </Link>
          ) : undefined
        }
      />

      <form action={updateCondition} className="space-y-6">
        <input type="hidden" name="id" value={condition.id} />

        <AdminCard title="Page content">
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="label">
                Condition name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={condition.name}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="summary" className="label">
                One-line summary
              </label>
              <input
                id="summary"
                name="summary"
                required
                defaultValue={condition.summary}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="body" className="label">
                Main content
              </label>
              <textarea
                id="body"
                name="body"
                rows={20}
                defaultValue={condition.body}
                className="input font-mono text-sm leading-relaxed"
              />
              <p className="hint">
                Leave a blank line between paragraphs. Start a line with{" "}
                <code className="rounded bg-ink-100 px-1">## </code> for a
                heading, <code className="rounded bg-ink-100 px-1">- </code> for
                a bullet, and wrap text in{" "}
                <code className="rounded bg-ink-100 px-1">**stars**</code> for
                bold.
              </p>
            </div>
          </div>
        </AdminCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard
            title="Common symptoms"
            description="One per line. Shown in the sidebar box."
          >
            <textarea
              name="symptoms"
              rows={8}
              defaultValue={condition.symptoms}
              className="input text-sm"
            />
          </AdminCard>

          <AdminCard
            title="When to see an endocrinologist"
            description="One per line. Shown in the highlighted sidebar box."
          >
            <textarea
              name="whenToSee"
              rows={8}
              defaultValue={condition.whenToSee}
              className="input text-sm"
            />
          </AdminCard>
        </div>

        <AdminCard
          title="Search engine listing"
          description="What Google shows when this page appears in results."
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="metaTitle" className="label">
                Search title
              </label>
              <input
                id="metaTitle"
                name="metaTitle"
                defaultValue={condition.metaTitle ?? ""}
                className="input"
              />
              <p className="hint">
                Aim for under 60 characters, and include the area — for example
                “Thyroid Specialist in Shalimar Bagh”.
              </p>
            </div>
            <div>
              <label htmlFor="metaDescription" className="label">
                Search description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                defaultValue={condition.metaDescription ?? ""}
                className="input"
              />
              <p className="hint">Aim for 140–160 characters.</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Publishing">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="published"
                defaultChecked={condition.published}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Published
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={condition.featured}
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Feature on the home page
            </label>
            <div className="flex items-center gap-2.5">
              <label htmlFor="sortOrder" className="text-sm text-ink-800">
                Order
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={condition.sortOrder}
                className="input w-24"
              />
            </div>
          </div>
          <div className="mt-5 border-t border-ink-200 pt-5">
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </AdminCard>
      </form>

      <AdminCard
        title="Questions on this page"
        description="FAQs assigned to this condition appear at the bottom of its page. Add and edit them under FAQs."
        className="mt-6"
      >
        {condition.faqs.length === 0 ? (
          <p className="text-sm text-ink-500">
            No questions assigned yet.{" "}
            <Link href="/admin/faqs" className="font-medium text-brand-700 hover:underline">
              Add one →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-ink-200 text-sm">
            {condition.faqs.map((faq) => (
              <li key={faq.id} className="py-2.5 text-ink-700">
                {faq.question}
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Delete condition" className="mt-6 border-red-200">
        <p className="text-sm leading-relaxed text-ink-600">
          This removes the page and its address permanently. If the page already
          ranks in Google, unpublishing is usually the better option.
        </p>
        <form action={deleteCondition} className="mt-4">
          <input type="hidden" name="id" value={condition.id} />
          <ConfirmButton
            message={`Delete the ${condition.name} page permanently?`}
            className="btn-danger px-4 py-2 text-sm"
          >
            Delete permanently
          </ConfirmButton>
        </form>
      </AdminCard>
    </>
  );
}
