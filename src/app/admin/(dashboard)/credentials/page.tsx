import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import {
  createCredential,
  deleteCredential,
  updateCredential,
} from "./actions";

const KIND_LABELS: Record<string, string> = {
  degree: "Education & qualifications",
  position: "Professional experience",
  membership: "Memberships",
  award: "Awards & recognition",
};

const KIND_ORDER = ["degree", "position", "membership", "award"];

function KindSelect({ id, defaultValue }: { id: string; defaultValue: string }) {
  return (
    <select id={id} name="kind" defaultValue={defaultValue} className="input">
      {KIND_ORDER.map((kind) => (
        <option key={kind} value={kind}>
          {KIND_LABELS[kind]}
        </option>
      ))}
    </select>
  );
}

export default async function AdminCredentialsPage() {
  const credentials = await prisma.credential.findMany({
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
  });

  const groups = KIND_ORDER.map((kind) => ({
    kind,
    label: KIND_LABELS[kind],
    items: credentials.filter((c) => c.kind === kind),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader
        title="Credentials"
        description="Degrees, past positions, memberships and awards. These carry most of the weight on the About page — for a consultant early in practice, training pedigree is the strongest trust signal there is."
      />

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.kind}>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-500 uppercase">
              {group.label}
            </h2>
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-ink-200 bg-white p-5"
                >
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2.5">
                          <span className="font-medium text-ink-900">
                            {item.title}
                          </span>
                          {!item.published && (
                            <span className="badge bg-ink-100 text-ink-500">
                              Hidden
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm text-ink-500">
                          {item.institution}
                          {item.period ? ` · ${item.period}` : ""}
                        </span>
                      </span>
                      <span className="text-sm font-medium text-brand-700">
                        Edit
                      </span>
                    </summary>

                    <form
                      action={updateCredential}
                      className="mt-5 space-y-4 border-t border-ink-200 pt-5"
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor={`kind-${item.id}`}>
                            Category
                          </label>
                          <KindSelect id={`kind-${item.id}`} defaultValue={item.kind} />
                        </div>
                        <div>
                          <label className="label" htmlFor={`period-${item.id}`}>
                            Year or period
                          </label>
                          <input
                            id={`period-${item.id}`}
                            name="period"
                            defaultValue={item.period ?? ""}
                            placeholder="2023 or 2020 – 2023"
                            className="input"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="label" htmlFor={`title-${item.id}`}>
                          Title
                        </label>
                        <input
                          id={`title-${item.id}`}
                          name="title"
                          required
                          defaultValue={item.title}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor={`institution-${item.id}`}>
                          Institution
                        </label>
                        <input
                          id={`institution-${item.id}`}
                          name="institution"
                          defaultValue={item.institution ?? ""}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor={`detail-${item.id}`}>
                          Extra detail
                        </label>
                        <input
                          id={`detail-${item.id}`}
                          name="detail"
                          defaultValue={item.detail ?? ""}
                          className="input"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-6">
                        <label className="flex items-center gap-2.5 text-sm text-ink-800">
                          <input
                            type="checkbox"
                            name="published"
                            defaultChecked={item.published}
                            className="h-4 w-4 rounded border-ink-300 text-brand-600"
                          />
                          Show on website
                        </label>
                        <div className="flex items-center gap-2.5">
                          <label
                            htmlFor={`sortOrder-${item.id}`}
                            className="text-sm text-ink-800"
                          >
                            Order
                          </label>
                          <input
                            id={`sortOrder-${item.id}`}
                            name="sortOrder"
                            type="number"
                            defaultValue={item.sortOrder}
                            className="input w-24"
                          />
                        </div>
                      </div>
                      <div className="border-t border-ink-200 pt-4">
                        <SubmitButton className="btn-primary px-4 py-2 text-sm" />
                      </div>
                    </form>

                    <form action={deleteCredential} className="mt-3">
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton message={`Delete “${item.title}”?`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <AdminCard title="Add a credential" className="mt-8">
        <form action={createCredential} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="new-kind" className="label">
                Category
              </label>
              <KindSelect id="new-kind" defaultValue="degree" />
            </div>
            <div>
              <label htmlFor="new-period" className="label">
                Year or period
              </label>
              <input
                id="new-period"
                name="period"
                placeholder="2023"
                className="input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-title" className="label">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="new-title"
              name="title"
              required
              placeholder="Member, Endocrine Society of India"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="new-institution" className="label">
              Institution
            </label>
            <input id="new-institution" name="institution" className="input" />
          </div>
          <div>
            <label htmlFor="new-detail" className="label">
              Extra detail
            </label>
            <input id="new-detail" name="detail" className="input" />
          </div>
          <SubmitButton pendingLabel="Adding…">Add credential</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
