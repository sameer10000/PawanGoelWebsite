"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitBooking, type BookingState } from "@/app/(site)/book/actions";
import { formatPhone, telHref, whatsappHref } from "@/lib/format";

type LocationOption = {
  id: number;
  slug: string;
  name: string;
  area: string;
  bookingUrl: string | null;
};

const initialState: BookingState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? "Sending…" : "Send appointment request"}
    </button>
  );
}

export function BookingForm({
  locations,
  defaultLocationSlug,
  concerns,
  phone,
  whatsapp,
  doctorName,
}: {
  locations: LocationOption[];
  defaultLocationSlug?: string;
  concerns: string[];
  phone: string;
  whatsapp: string;
  doctorName: string;
}) {
  const [state, formAction] = useActionState(submitBooking, initialState);

  const defaultLocation = locations.find((l) => l.slug === defaultLocationSlug);
  const today = new Date().toISOString().slice(0, 10);

  if (state.ok && state.message) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
        <div
          aria-hidden
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-xl text-white"
        >
          ✓
        </div>
        <h2 className="mt-4 font-serif text-2xl font-semibold">Request received</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-700">
          {state.message}
        </p>
        <p className="mt-4 text-sm text-ink-500">
          This is a request, not a confirmed booking. You will be contacted to fix
          a time.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.degraded ? (
        <div
          role="alert"
          className="rounded-xl border border-accent-500/40 bg-accent-100 p-5"
        >
          <h2 className="font-serif text-lg font-semibold text-ink-900">
            Please call us instead
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-700">
            {state.message}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a href={telHref(phone)} className="btn-primary px-4 py-2.5 text-sm">
              Call {formatPhone(phone)}
            </a>
            <a
              href={whatsappHref(
                whatsapp,
                `Hello, I would like to book an appointment with ${doctorName}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2.5 text-sm"
            >
              WhatsApp
            </a>
          </div>
          <p className="mt-3 text-xs text-ink-600">
            Your details are still filled in below if you would rather try
            sending the form again.
          </p>
        </div>
      ) : (
        state.message &&
        !state.ok && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {state.message}
          </p>
        )
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="input"
            aria-invalid={Boolean(state.errors?.name)}
          />
          {state.errors?.name && (
            <p className="mt-1.5 text-xs text-red-700">{state.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Mobile number <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            className="input"
            aria-invalid={Boolean(state.errors?.phone)}
          />
          {state.errors?.phone && (
            <p className="mt-1.5 text-xs text-red-700">{state.errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label">
          Email <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input"
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && (
          <p className="mt-1.5 text-xs text-red-700">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="locationId" className="label">
          Preferred location
        </label>
        <select
          id="locationId"
          name="locationId"
          defaultValue={defaultLocation ? String(defaultLocation.id) : ""}
          className="input"
        >
          <option value="">No preference</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} — {location.area}
            </option>
          ))}
        </select>
        <p className="hint">
          Hospital appointments may also need to be confirmed through the
          hospital&rsquo;s own booking line.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="preferredDate" className="label">
            Preferred date
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={today}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="preferredTime" className="label">
            Preferred time
          </label>
          <select id="preferredTime" name="preferredTime" className="input" defaultValue="">
            <option value="">Any time</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="concern" className="label">
          What is this regarding?
        </label>
        <select id="concern" name="concern" className="input" defaultValue="">
          <option value="">Select a reason</option>
          {concerns.map((concern) => (
            <option key={concern} value={concern}>
              {concern}
            </option>
          ))}
          <option value="Other">Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="label">
          Anything else the clinic should know?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input"
          placeholder="Current medicines, recent test results, or how long you have had these symptoms."
        />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 border-t border-ink-200 pt-5">
        <SubmitButton />
        <p className="text-xs leading-relaxed text-ink-500">
          By submitting this form you consent to the clinic contacting you about
          this request. Your details are stored only for scheduling and are never
          shared. Please do not use this form for medical emergencies — call your
          nearest hospital instead.
        </p>
      </div>
    </form>
  );
}
