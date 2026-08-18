import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-ink-600">
          The page you are looking for has moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go to home page
          </Link>
          <Link href="/book" className="btn-secondary">
            Book an appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
