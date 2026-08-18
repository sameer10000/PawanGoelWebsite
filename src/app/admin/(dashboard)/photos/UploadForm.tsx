"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadPhoto, type PhotoState } from "./actions";

/** Longest edge kept. 2400px is plenty for a full-width hero on a retina screen. */
const MAX_DIMENSION = 2400;
const JPEG_QUALITY = 0.85;
/** Below this, leave the file alone — re-encoding would only lose quality. */
const PASSTHROUGH_BYTES = 1_200_000;

/**
 * Downscale in the browser before submitting.
 *
 * Server Actions cap request bodies (1 MB by default, and Vercel refuses
 * anything over ~4.5 MB at the edge regardless of config), while a photo
 * straight off a phone is routinely 3–8 MB. Shrinking here means uploads
 * land well under any limit, the database stays small, and pages load faster.
 */
async function optimiseImage(file: File): Promise<File> {
  if (file.size <= PASSTHROUGH_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );

    // If re-encoding didn't actually help, keep the original.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    // Any decoding failure: send the original and let the server decide.
    return file;
  }
}

function formatSize(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_048_576).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

function SubmitButton({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || busy}
      className="btn-primary"
    >
      {pending ? "Uploading…" : busy ? "Preparing…" : "Upload image"}
    </button>
  );
}

export function UploadForm() {
  const [state, formAction] = useActionState<PhotoState, FormData>(uploadPhoto, {});
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const original = input.files?.[0];
    if (!original) {
      setNote(null);
      return;
    }

    setBusy(true);
    setNote("Preparing image…");

    const optimised = await optimiseImage(original);

    if (optimised !== original) {
      // Swap the chosen file for the smaller one so the normal form submit
      // sends it — this keeps useActionState and useFormStatus working.
      const transfer = new DataTransfer();
      transfer.items.add(optimised);
      input.files = transfer.files;
      setNote(
        `Resized from ${formatSize(original.size)} to ${formatSize(optimised.size)} before upload.`,
      );
    } else {
      setNote(`${formatSize(original.size)} — no resizing needed.`);
    }

    setBusy(false);
  }

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
          onChange={handleFileChange}
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="hint">
          JPG, PNG, WebP or AVIF. Large photos are resized automatically before
          uploading, so a picture straight from a phone is fine.
        </p>
        {note && <p className="mt-1.5 text-xs font-medium text-brand-700">{note}</p>}
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

      <SubmitButton busy={busy} />
    </form>
  );
}
