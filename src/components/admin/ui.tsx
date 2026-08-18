"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children = "Save changes",
  pendingLabel = "Saving…",
  className = "btn-primary",
}: {
  children?: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * Destructive actions get a native confirm dialog. Deliberately plain — the
 * person using this is the site owner, not a general audience, and a real
 * dialog is less likely to be dismissed by habit than a custom one.
 */
export function ConfirmButton({
  children,
  message,
  className = "text-sm font-medium text-red-700 hover:underline",
}: {
  children: ReactNode;
  message: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? "Working…" : children}
    </button>
  );
}
