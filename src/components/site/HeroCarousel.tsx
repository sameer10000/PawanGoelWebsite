"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type CarouselPhoto = {
  id: string | number;
  url: string;
  alt: string;
};

export function HeroCarousel({ photos }: { photos: CarouselPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  return (
    <div
      className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 lg:max-w-[460px]"
      aria-roledescription="carousel"
      aria-label="Photographs of Dr. Pawan Goel"
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
            index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 540px"
            className="object-cover"
          />
        </div>
      ))}

      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/35 to-transparent pb-4 pt-10">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full border border-white/80 transition-colors ${
                index === activeIndex ? "bg-white" : "bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
