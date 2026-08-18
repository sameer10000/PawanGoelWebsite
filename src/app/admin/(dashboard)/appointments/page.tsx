import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/admin/PageHeader";
import { SubmitButton, ConfirmButton } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatPhone, telHref, whatsappHref } from "@/lib/format";
import {
  deleteAppointment,
  setAppointmentStatus,
  updateAppointment,
} from "./actions";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-brand-100 text-brand-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-ink-100 text-ink-600",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.key === status) ? status! : "all";

  const appointments = await prisma.appointment.findMany({
    where: active === "all" ? {} : { status: active },
    orderBy: { createdAt: "desc" },
    include: { location: true },
  });

  const counts = await prisma.appointment.groupBy({
    by: ["status"],
    _count: true,
  });
  const countFor = (key: string) =>
    key === "all"
      ? counts.reduce((sum, row) => sum + row._count, 0)
      : (counts.find((row) => row.status === key)?._count ?? 0);

  return (
    <>
      <PageHeader
        title="Appointment requests"
        description="Requests submitted through the website booking form. Call the patient to confirm, then update the status here."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            href={
              filter.key === "all"
                ? "/admin/appointments"
                : `/admin/appointments?status=${filter.key}`
            }
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === filter.key
                ? "bg-brand-600 text-white"
                : "border border-ink-200 bg-white text-ink-600 hover:border-brand-400"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 opacity-70">{countFor(filter.key)}</span>
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="No requests here"
          description="New submissions from the website booking form will appear in this list."
        />
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="rounded-xl border border-ink-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-serif text-lg font-semibold text-ink-900">
                      {appointment.name}
                    </h2>
                    <span
                      className={`badge ${STATUS_STYLES[appointment.status] ?? "bg-ink-100 text-ink-600"}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    Received {formatDateTime(appointment.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={telHref(appointment.phone)}
                    className="btn-secondary px-3.5 py-2 text-sm"
                  >
                    Call {formatPhone(appointment.phone)}
                  </a>
                  <a
                    href={whatsappHref(
                      appointment.phone,
                      `Hello ${appointment.name}, this is regarding your appointment request with Dr. Pawan Goel.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp px-3.5 py-2 text-sm"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                {appointment.email && (
                  <div>
                    <dt className="text-xs text-ink-500">Email</dt>
                    <dd className="mt-0.5 truncate text-ink-800">
                      <a
                        href={`mailto:${appointment.email}`}
                        className="hover:text-brand-700"
                      >
                        {appointment.email}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-ink-500">Location</dt>
                  <dd className="mt-0.5 text-ink-800">
                    {appointment.location?.name ?? "No preference"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-500">Preferred</dt>
                  <dd className="mt-0.5 text-ink-800">
                    {appointment.preferredDate
                      ? formatDate(appointment.preferredDate)
                      : "Any date"}
                    {appointment.preferredTime ? ` · ${appointment.preferredTime}` : ""}
                  </dd>
                </div>
                {appointment.concern && (
                  <div>
                    <dt className="text-xs text-ink-500">Regarding</dt>
                    <dd className="mt-0.5 text-ink-800">{appointment.concern}</dd>
                  </div>
                )}
              </dl>

              {appointment.message && (
                <p className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
                  {appointment.message}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-200 pt-4">
                {appointment.status !== "confirmed" && (
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <SubmitButton
                      className="btn-primary px-3.5 py-2 text-sm"
                      pendingLabel="…"
                    >
                      Mark confirmed
                    </SubmitButton>
                  </form>
                )}
                {appointment.status !== "completed" && (
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="status" value="completed" />
                    <SubmitButton
                      className="btn-secondary px-3.5 py-2 text-sm"
                      pendingLabel="…"
                    >
                      Mark completed
                    </SubmitButton>
                  </form>
                )}
                {appointment.status !== "cancelled" && (
                  <form action={setAppointmentStatus}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <SubmitButton
                      className="btn-secondary px-3.5 py-2 text-sm"
                      pendingLabel="…"
                    >
                      Cancel
                    </SubmitButton>
                  </form>
                )}
                <form action={deleteAppointment} className="ml-auto">
                  <input type="hidden" name="id" value={appointment.id} />
                  <ConfirmButton message="Delete this appointment request permanently?">
                    Delete
                  </ConfirmButton>
                </form>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-ink-600 hover:text-brand-700">
                  Internal notes
                  {appointment.adminNotes ? " (saved)" : ""}
                </summary>
                <form action={updateAppointment} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={appointment.id} />
                  <input type="hidden" name="status" value={appointment.status} />
                  <textarea
                    name="adminNotes"
                    rows={3}
                    defaultValue={appointment.adminNotes ?? ""}
                    className="input"
                    placeholder="Called on 12th, patient will come Saturday evening."
                  />
                  <SubmitButton className="btn-secondary px-4 py-2 text-sm">
                    Save note
                  </SubmitButton>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
