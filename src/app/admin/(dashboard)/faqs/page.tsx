import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { createFaq, deleteFaq, updateFaq } from "./actions";

export default async function AdminFaqsPage() {
  const [faqs, conditions] = await Promise.all([
    prisma.faq.findMany({
      orderBy: { sortOrder: "asc" },
      include: { condition: true },
    }),
    prisma.condition.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const conditionOptions = (
    <>
      <option value="">General — shown on the FAQ page</option>
      {conditions.map((condition) => (
        <option key={condition.id} value={condition.id}>
          {condition.name}
        </option>
      ))}
    </>
  );

  return (
    <>
      <PageHeader
        title="FAQs"
        description="General questions appear on the FAQ page and the home page. Questions assigned to a condition appear at the bottom of that condition's page as well."
      />

      <ul className="space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id} className="rounded-xl border border-ink-200 bg-white p-5">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-medium text-ink-900">{faq.question}</span>
                    {!faq.published && (
                      <span className="badge bg-ink-100 text-ink-500">Hidden</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {faq.condition ? faq.condition.name : "General"}
                  </span>
                </span>
                <span className="text-sm font-medium text-brand-700">Edit</span>
              </summary>

              <form
                action={updateFaq}
                className="mt-5 space-y-4 border-t border-ink-200 pt-5"
              >
                <input type="hidden" name="id" value={faq.id} />
                <div>
                  <label className="label" htmlFor={`question-${faq.id}`}>
                    Question
                  </label>
                  <input
                    id={`question-${faq.id}`}
                    name="question"
                    required
                    defaultValue={faq.question}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`answer-${faq.id}`}>
                    Answer
                  </label>
                  <textarea
                    id={`answer-${faq.id}`}
                    name="answer"
                    rows={5}
                    required
                    defaultValue={faq.answer}
                    className="input"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`conditionId-${faq.id}`}>
                      Show under
                    </label>
                    <select
                      id={`conditionId-${faq.id}`}
                      name="conditionId"
                      defaultValue={faq.conditionId ? String(faq.conditionId) : ""}
                      className="input"
                    >
                      {conditionOptions}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor={`sortOrder-${faq.id}`}>
                      Order
                    </label>
                    <input
                      id={`sortOrder-${faq.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={faq.sortOrder}
                      className="input"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-ink-800">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={faq.published}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600"
                  />
                  Show on website
                </label>
                <div className="border-t border-ink-200 pt-4">
                  <SubmitButton className="btn-primary px-4 py-2 text-sm" />
                </div>
              </form>

              <form action={deleteFaq} className="mt-3">
                <input type="hidden" name="id" value={faq.id} />
                <ConfirmButton message="Delete this question?">Delete</ConfirmButton>
              </form>
            </details>
          </li>
        ))}
      </ul>

      <AdminCard title="Add a question" className="mt-8">
        <form action={createFaq} className="space-y-5">
          <div>
            <label htmlFor="new-question" className="label">
              Question <span className="text-red-600">*</span>
            </label>
            <input
              id="new-question"
              name="question"
              required
              placeholder="Do you accept insurance or cashless treatment?"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="new-answer" className="label">
              Answer <span className="text-red-600">*</span>
            </label>
            <textarea
              id="new-answer"
              name="answer"
              rows={4}
              required
              className="input"
            />
          </div>
          <div>
            <label htmlFor="new-conditionId" className="label">
              Show under
            </label>
            <select
              id="new-conditionId"
              name="conditionId"
              defaultValue=""
              className="input"
            >
              {conditionOptions}
            </select>
          </div>
          <SubmitButton pendingLabel="Adding…">Add question</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
