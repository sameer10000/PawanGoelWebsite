import Image from "next/image";

type LocationLogoProps = {
  slug: string;
  name: string;
};

const LOGO_ASSETS: Record<string, string> = {
  "shalimar-bagh-clinic": "/logos/shalimar-bagh-clinic.jpeg",
  "max-shalimar-bagh": "/logos/max-healthcare.svg",
  "maharaja-agrasen-punjabi-bagh": "/logos/maharaja-agrasen.png",
  "jj-institute-bahadurgarh": "/logos/jj-institute.png",
  "pentamed-model-town": "/logos/pentamed.jpg",
  "saroj-hospital-rohini": "/logos/saroj-hospital.svg",
};

const FALLBACK_STYLES: Record<string, { mark: string; label: string; className: string }> = {
  "shalimar-bagh-clinic": {
    mark: "D&E",
    label: "Clinic",
    className: "border-brand-200 bg-brand-50 text-brand-800",
  },
  "max-shalimar-bagh": {
    mark: "Max",
    label: "Hospital",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "maharaja-agrasen-punjabi-bagh": {
    mark: "MAH",
    label: "Hospital",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "jj-institute-bahadurgarh": {
    mark: "JJ",
    label: "Medical",
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  "pentamed-model-town": {
    mark: "Penta",
    label: "Hospital",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  "saroj-hospital-rohini": {
    mark: "Saroj",
    label: "Hospital",
    className: "border-rose-200 bg-rose-50 text-rose-800",
  },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function LocationLogo({ slug, name }: LocationLogoProps) {
  const logoSrc = LOGO_ASSETS[slug];
  if (logoSrc) {
    return (
      <div
        className="relative flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white p-2"
        aria-label={`${name} logo`}
      >
        <Image
          src={logoSrc}
          alt={`${name} logo`}
          fill
          sizes="80px"
          className="object-contain p-2"
        />
      </div>
    );
  }

  const logo = FALLBACK_STYLES[slug] ?? {
    mark: initials(name),
    label: "Location",
    className: "border-ink-200 bg-ink-50 text-ink-700",
  };

  return (
    <div
      className={`flex h-14 w-20 shrink-0 flex-col items-center justify-center rounded-lg border text-center ${logo.className}`}
      aria-label={`${name} logo`}
    >
      <span className="text-sm font-bold leading-none">{logo.mark}</span>
      <span className="mt-1 text-[10px] font-medium leading-none opacity-75">
        {logo.label}
      </span>
    </div>
  );
}
