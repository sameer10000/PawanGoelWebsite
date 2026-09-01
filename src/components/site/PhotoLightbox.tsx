"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type LightboxPhoto = {
  id: number;
  url: string;
  alt: string;
  caption: string | null;
};

export function PhotoLightbox({ photos }: { photos: LightboxPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(
    () =>
      setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const showNext = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, close, showPrev, showNext]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <ul
        className={`mt-5 grid gap-4 ${
          photos.length === 1
            ? "sm:grid-cols-1"
            : photos.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <figure>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-ink-200 bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
              {photo.caption && (
                <figcaption className="mt-2 text-sm text-ink-500">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-full flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- intrinsic size varies per photo; next/image fill needs a sized parent this dialog doesn't have */}
            <img
              src={active.url}
              alt={active.alt}
              className="max-h-[85vh] max-w-[92vw] object-contain"
            />
            {active.caption && (
              <figcaption className="mt-3 max-w-2xl text-center text-sm text-white/70">
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
