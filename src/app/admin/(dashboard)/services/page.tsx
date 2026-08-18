import { PageHeader, AdminCard } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { createService, deleteService, updateService } from "./actions";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <>
      <PageHeader
        title="Services"
        description="Procedures and technology offered — shown on the Services page and in the home page grid."
      />

      <ul className="space-y-3">
        {services.map((service) => (
          <li
            key={service.id}
            className="rounded-xl border border-ink-200 bg-white p-5"
          >
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 list-none">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif text-lg font-semibold text-ink-900">
                      {service.name}
                    </span>
                    {!service.published && (
                      <span className="badge bg-ink-100 text-ink-500">Hidden</span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-ink-600">
                    {service.summary}
                  </span>
                </span>
                <span className="text-sm font-medium text-brand-700">Edit</span>
              </summary>

              <form
                action={updateService}
                className="mt-5 space-y-4 border-t border-ink-200 pt-5"
              >
                <input type="hidden" name="id" value={service.id} />
                <div>
                  <label className="label" htmlFor={`name-${service.id}`}>
                    Name
                  </label>
                  <input
                    id={`name-${service.id}`}
                    name="name"
                    required
                    defaultValue={service.name}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`summary-${service.id}`}>
                    One-line summary
                  </label>
                  <input
                    id={`summary-${service.id}`}
                    name="summary"
                    required
                    defaultValue={service.summary}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`body-${service.id}`}>
                    Description
                  </label>
                  <textarea
                    id={`body-${service.id}`}
                    name="body"
                    rows={8}
                    defaultValue={service.body}
                    className="input font-mono text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2.5 text-sm text-ink-800">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={service.published}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600"
                    />
                    Show on website
                  </label>
                  <div className="flex items-center gap-2.5">
                    <label
                      htmlFor={`sortOrder-${service.id}`}
                      className="text-sm text-ink-800"
                    >
                      Order
                    </label>
                    <input
                      id={`sortOrder-${service.id}`}
                      name="sortOrder"
                      type="number"
                      defaultValue={service.sortOrder}
                      className="input w-24"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-ink-200 pt-4">
                  <SubmitButton className="btn-primary px-4 py-2 text-sm" />
                </div>
              </form>

              <form action={deleteService} className="mt-3">
                <input type="hidden" name="id" value={service.id} />
                <ConfirmButton message={`Delete “${service.name}” permanently?`}>
                  Delete this service
                </ConfirmButton>
              </form>
            </details>
          </li>
        ))}
      </ul>

      <AdminCard title="Add a service" className="mt-8">
        <form action={createService} className="space-y-5">
          <div>
            <label htmlFor="new-name" className="label">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              id="new-name"
              name="name"
              required
              placeholder="Thyroid Ultrasound"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="new-summary" className="label">
              One-line summary <span className="text-red-600">*</span>
            </label>
            <input id="new-summary" name="summary" required className="input" />
          </div>
          <div>
            <label htmlFor="new-body" className="label">
              Description
            </label>
            <textarea id="new-body" name="body" rows={5} className="input" />
          </div>
          <SubmitButton pendingLabel="Adding…">Add service</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
