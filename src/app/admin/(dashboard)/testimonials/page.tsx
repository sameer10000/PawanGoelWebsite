import { PageHeader, AdminCard, EmptyState } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "./actions";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Patient feedback shown on the home page. A testimonial can only be published once consent has been recorded."
      />

      <div className="mb-6 rounded-xl border border-accent-500/30 bg-accent-100 p-5">
        <h2 className="text-sm font-semibold text-ink-900">
          Before publishing a testimonial
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
          <li>
            Get the patient&rsquo;s written consent — a WhatsApp message saying
            it is fine to publish is enough, but keep it.
          </li>
          <li>
            Avoid text that promises a cure or a guaranteed result. Descriptions
            of the experience are safer than claims about outcomes.
          </li>
          <li>
            Use a first name and area rather than a full name where possible.
          </li>
        </ul>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Google reviews tend to carry more weight with patients than self-hosted quotes — consider asking for those too."
        />
      ) : (
        <ul className="space-y-3">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.id}
              className="rounded-xl border border-ink-200 bg-white p-5"
            >
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="font-medium text-ink-900">
                        {testimonial.patientName}
                      </span>
                      <span
                        className={`badge ${
                          testimonial.published
                            ? "bg-green-100 text-green-800"
                            : "bg-ink-100 text-ink-500"
                        }`}
                      >
                        {testimonial.published ? "Live" : "Not published"}
                      </span>
                      {!testimonial.consentRecorded && (
                        <span className="badge bg-red-100 text-red-800">
                          No consent recorded
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block max-w-2xl text-sm text-ink-600">
                      “{testimonial.text.slice(0, 140)}
                      {testimonial.text.length > 140 ? "…" : ""}”
                    </span>
                  </span>
                  <span className="text-sm font-medium text-brand-700">Edit</span>
                </summary>

                <form
                  action={updateTestimonial}
                  className="mt-5 space-y-4 border-t border-ink-200 pt-5"
                >
                  <input type="hidden" name="id" value={testimonial.id} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="label" htmlFor={`patientName-${testimonial.id}`}>
                        Name shown
                      </label>
                      <input
                        id={`patientName-${testimonial.id}`}
                        name="patientName"
                        required
                        defaultValue={testimonial.patientName}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor={`area-${testimonial.id}`}>
                        Area
                      </label>
                      <input
                        id={`area-${testimonial.id}`}
                        name="area"
                        defaultValue={testimonial.area ?? ""}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor={`sortOrder-${testimonial.id}`}>
                        Order
                      </label>
                      <input
                        id={`sortOrder-${testimonial.id}`}
                        name="sortOrder"
                        type="number"
                        defaultValue={testimonial.sortOrder}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor={`text-${testimonial.id}`}>
                      Testimonial
                    </label>
                    <textarea
                      id={`text-${testimonial.id}`}
                      name="text"
                      rows={4}
                      required
                      defaultValue={testimonial.text}
                      className="input"
                    />
                  </div>
                  <input type="hidden" name="rating" value={testimonial.rating} />
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2.5 text-sm text-ink-800">
                      <input
                        type="checkbox"
                        name="consentRecorded"
                        defaultChecked={testimonial.consentRecorded}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600"
                      />
                      Written consent obtained and kept
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-ink-800">
                      <input
                        type="checkbox"
                        name="published"
                        defaultChecked={testimonial.published}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600"
                      />
                      Show on website
                    </label>
                  </div>
                  <div className="border-t border-ink-200 pt-4">
                    <SubmitButton className="btn-primary px-4 py-2 text-sm" />
                  </div>
                </form>

                <form action={deleteTestimonial} className="mt-3">
                  <input type="hidden" name="id" value={testimonial.id} />
                  <ConfirmButton message="Delete this testimonial?">
                    Delete
                  </ConfirmButton>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}

      <AdminCard title="Add a testimonial" className="mt-8">
        <form action={createTestimonial} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="new-patientName" className="label">
                Name shown <span className="text-red-600">*</span>
              </label>
              <input
                id="new-patientName"
                name="patientName"
                required
                placeholder="Sunita R."
                className="input"
              />
            </div>
            <div>
              <label htmlFor="new-area" className="label">
                Area
              </label>
              <input
                id="new-area"
                name="area"
                placeholder="Rohini"
                className="input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-text" className="label">
              Testimonial <span className="text-red-600">*</span>
            </label>
            <textarea id="new-text" name="text" rows={4} required className="input" />
          </div>
          <input type="hidden" name="rating" value={5} />
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="consentRecorded"
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Written consent obtained and kept
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink-800">
              <input
                type="checkbox"
                name="published"
                className="h-4 w-4 rounded border-ink-300 text-brand-600"
              />
              Show on website
            </label>
          </div>
          <SubmitButton pendingLabel="Adding…">Add testimonial</SubmitButton>
        </form>
      </AdminCard>
    </>
  );
}
