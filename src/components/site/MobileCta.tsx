import Link from "next/link";
import { telHref, whatsappHref } from "@/lib/format";

/**
 * Persistent call / WhatsApp / book bar on phones. In India WhatsApp is by far
 * the most-used channel for clinic enquiries, so it gets equal billing.
 */
export function MobileCta({
  phone,
  whatsapp,
  doctorName,
}: {
  phone: string;
  whatsapp: string;
  doctorName: string;
}) {
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/97 backdrop-blur sm:hidden">
      <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
        <a href={telHref(phone)} className="btn-secondary px-2 py-2.5 text-xs">
          Call
        </a>
        <a
          href={whatsappHref(
            whatsapp,
            `Hello, I would like to book an appointment with ${doctorName}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp px-2 py-2.5 text-xs"
        >
          WhatsApp
        </a>
        <Link href="/book" className="btn-primary px-2 py-2.5 text-xs">
          Book
        </Link>
      </div>
    </div>
  );
}
