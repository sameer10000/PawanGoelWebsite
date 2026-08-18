type LocationValues = {
  name: string;
  kind: string;
  addressLine: string;
  area: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  fee: number | null;
  notes: string | null;
  bookingUrl: string | null;
  mapUrl: string | null;
  mapEmbedUrl: string | null;
  isPrimary: boolean;
  published: boolean;
  sortOrder: number;
};

const EMPTY: LocationValues = {
  name: "",
  kind: "hospital",
  addressLine: "",
  area: "",
  city: "Delhi",
  state: "Delhi",
  pincode: null,
  phone: null,
  fee: null,
  notes: null,
  bookingUrl: null,
  mapUrl: null,
  mapEmbedUrl: null,
  isPrimary: false,
  published: true,
  sortOrder: 0,
};

/** Shared between the "add location" form and the edit page. */
export function LocationFields({
  location = EMPTY,
}: {
  location?: LocationValues;
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={location.name}
            placeholder="Max Super Speciality Hospital"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="kind" className="label">
            Type
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={location.kind}
            className="input"
          >
            <option value="hospital">Hospital</option>
            <option value="clinic">Own clinic</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="addressLine" className="label">
          Address line <span className="text-red-600">*</span>
        </label>
        <input
          id="addressLine"
          name="addressLine"
          required
          defaultValue={location.addressLine}
          placeholder="FC-50, C & D Block"
          className="input"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <label htmlFor="area" className="label">
            Area <span className="text-red-600">*</span>
          </label>
          <input
            id="area"
            name="area"
            required
            defaultValue={location.area}
            placeholder="Shalimar Bagh"
            className="input"
          />
          <p className="hint">Used in local search titles.</p>
        </div>
        <div>
          <label htmlFor="city" className="label">
            City
          </label>
          <input id="city" name="city" defaultValue={location.city} className="input" />
        </div>
        <div>
          <label htmlFor="state" className="label">
            State
          </label>
          <input
            id="state"
            name="state"
            defaultValue={location.state}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="pincode" className="label">
            PIN code
          </label>
          <input
            id="pincode"
            name="pincode"
            inputMode="numeric"
            defaultValue={location.pincode ?? ""}
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="phone" className="label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={location.phone ?? ""}
            placeholder="+919999078196"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="fee" className="label">
            Consultation fee (₹)
          </label>
          <input
            id="fee"
            name="fee"
            type="number"
            min={0}
            defaultValue={location.fee ?? ""}
            className="input"
          />
          <p className="hint">Leave blank to hide the fee.</p>
        </div>
        <div>
          <label htmlFor="sortOrder" className="label">
            Display order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={location.sortOrder}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bookingUrl" className="label">
          Hospital booking link
        </label>
        <input
          id="bookingUrl"
          name="bookingUrl"
          type="url"
          defaultValue={location.bookingUrl ?? ""}
          placeholder="https://www.maxhealthcare.in/doctor/dr-pawan-goel"
          className="input"
        />
        <p className="hint">
          If set, the location page sends patients to the hospital&rsquo;s own
          booking system instead of the website form.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="mapUrl" className="label">
            Google Maps link
          </label>
          <input
            id="mapUrl"
            name="mapUrl"
            type="url"
            defaultValue={location.mapUrl ?? ""}
            placeholder="https://maps.app.goo.gl/…"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="mapEmbedUrl" className="label">
            Google Maps embed URL
          </label>
          <input
            id="mapEmbedUrl"
            name="mapEmbedUrl"
            type="url"
            defaultValue={location.mapEmbedUrl ?? ""}
            placeholder="https://www.google.com/maps/embed?pb=…"
            className="input"
          />
          <p className="hint">
            In Google Maps: Share → Embed a map → copy the src value only.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Note shown to patients
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={location.notes ?? ""}
          placeholder="Reception also books on 9910489495."
          className="input"
        />
      </div>

      <div className="flex flex-wrap gap-6 border-t border-ink-200 pt-4">
        <label className="flex items-center gap-2.5 text-sm text-ink-800">
          <input
            type="checkbox"
            name="published"
            defaultChecked={location.published}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          Show on website
        </label>
        <label className="flex items-center gap-2.5 text-sm text-ink-800">
          <input
            type="checkbox"
            name="isPrimary"
            defaultChecked={location.isPrimary}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          This is Dr. Goel&rsquo;s own clinic
        </label>
      </div>
    </>
  );
}
