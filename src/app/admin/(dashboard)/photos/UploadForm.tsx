"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadPhoto, type PhotoState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Uploading…" : "Upload image"}
    </button>
  );
}

export function UploadForm() {
  const [state, formAction] = useActionState<PhotoState, FormData>(uploadPhoto, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
          {state.success}
        </p>
      )}

      <div>
        <label htmlFor="file" className="label">
          Image file <span className="text-red-600">*</span>
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="hint">JPG, PNG, WebP or AVIF. Maximum 6 MB.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select id="category" name="category" defaultValue="clinic" className="input">
            <option value="portrait">Portrait of Dr. Goel</option>
            <option value="clinic">Clinic</option>
            <option value="equipment">Equipment</option>
            <option value="team">Team</option>
          </select>
          <p className="hint">
            The first “portrait” image, by order number, is used on the home and
            About pages.
          </p>
        </div>
        <div>
          <label htmlFor="alt" className="label">
            Description <span className="text-red-600">*</span>
          </label>
          <input
            id="alt"
            name="alt"
            required
            placeholder="Dr. Pawan Goel in consultation room"
            className="input"
          />
          <p className="hint">Read aloud by screen readers.</p>
        </div>
      </div>

      <div>
        <label htmlFor="caption" className="label">
          Caption
        </label>
        <input id="caption" name="caption" className="input" />
      </div>

      <SubmitButton />
    </form>
  );
}
