# Dr. Pawan Goel — practice website

Website and admin panel for a Consultant Endocrinologist practising across
multiple hospitals in Delhi NCR. Built for one purpose: bringing in new
patients through search.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 ·
PostgreSQL

**Deployment:** Vercel (the app) + Railway (Postgres). Two providers, nothing
else.

**Live:** https://drpawangoel.vercel.app

---

## Running it locally

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and SESSION_SECRET
npm run setup             # creates tables and loads starter content
npm run dev               # http://localhost:3000
```

`DATABASE_URL` points at your Railway Postgres — use `DATABASE_PUBLIC_URL` from
the Railway dashboard, or create a second Railway database if you want
development data kept separate.

The admin panel is at **/admin**. The login created by `npm run setup` is
printed in the terminal. Change it immediately under **Admin → Account**.

> **The site runs without a database.** If `DATABASE_URL` is missing or wrong,
> every public page still renders from the build-time snapshot. Only the admin
> panel needs a live database.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` → refresh snapshot → `next build` |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check without building |
| `npm run snapshot` | Refresh the offline content snapshot |
| `npm run db:push` | Apply schema changes to the database |
| `npm run db:seed` | Load starter content (safe — see below) |
| `npm run db:studio` | Browse the database in a GUI |

---

## ⚠️ Verify the seed data before going live

The starter content was assembled from Dr. Goel's **public hospital and
directory listings**, not from him. Sources disagreed in places. Confirm each
of these and correct it in the admin panel — never by editing code:

- **All OPD timings.** Two seeded sessions clash on Saturday (Maharaja Agrasen
  2–4 PM, then JJ Institute 4–6 PM in Bahadurgarh). At least one is likely
  wrong or out of date.
- **Phone numbers.** `+91 99990 78196` came from a third-party directory.
- **Consultation fees.** Only Maharaja Agrasen (₹1,000) was listed anywhere.
- **The clinic address**, `AE-188, Shalimar Bagh, Delhi 110088`.
- **Medical registration number** — not published anywhere, currently blank.

Two locations (Pentamed Model Town, Saroj Rohini) are seeded **hidden** because
no timings could be confirmed. The admin dashboard shows all of this as a
checklist.

**The seed will not overwrite live data.** Once the database has content,
`npm run db:seed` skips the content seed and only ensures an admin user exists.
To deliberately restore the starter data, run `SEED_FORCE=1 npm run db:seed`.

---

## Architecture

```
Vercel ──► Next.js app, server-rendered
            │
            └──► Railway Postgres  (content, appointments, photos)
```

### Staying up when the database isn't

The app and the database run on different providers, so a network partition
between them is a realistic failure, not a hypothetical one. Reads go through
three layers (`src/lib/resilient.ts`):

```
in-memory cache (60s)  →  Railway Postgres  →  build-time snapshot
```

The snapshot (`src/content/snapshot.json`) is regenerated on every build and
compiled into the deployed bundle, so the last layer needs no network at all.

**Verified with Postgres pointed at a dead host:** the production build still
succeeds, all public routes return 200, and the home page serves full content —
timings, phone numbers, the weekly schedule, every condition page, and the
"consulting today" panel.

Writes degrade honestly rather than silently. If the booking form cannot reach
the database, the patient is shown call and WhatsApp buttons instead of a
success message that would be a lie.

The admin panel does require a live database — by design.

### Photos

Image bytes live in Postgres (`PhotoFile`) and are served by the
`/media/[key]` route with a one-year immutable cache header, which is safe
because keys are random and never reused. Metadata sits in a separate `Photo`
table so listing photos never loads image data.

At this scale — a portrait and a handful of clinic photos — this avoids adding
an object-storage provider for a few megabytes, and it works identically in
development and on Cloud Run's ephemeral filesystem.

**Worth knowing:** photos are the one thing that does *not* survive a database
outage; the route returns 503 with a short cache. If that matters, commit the
portrait to `public/` and reference it directly — it changes rarely and is the
most important image on the site.

---

## Project layout

```
src/
├─ app/
│  ├─ (site)/           Public website
│  │  ├─ page.tsx              Home
│  │  ├─ about/               Biography and credentials
│  │  ├─ conditions/[slug]/   One SEO landing page per condition
│  │  ├─ services/            CGM, insulin pumps, counselling
│  │  ├─ locations/[slug]/    One page per hospital
│  │  ├─ book/                Appointment form + server action
│  │  ├─ contact/  faqs/
│  │  └─ privacy/ terms/ disclaimer/
│  ├─ admin/
│  │  ├─ login/               Unprotected
│  │  └─ (dashboard)/         Everything behind the auth guard
│  ├─ media/[key]/            Serves uploaded images from Postgres
│  ├─ sitemap.ts  robots.ts
├─ components/site/     Public UI, incl. WhereToday and WeeklyTimetable
├─ components/admin/    Admin UI primitives
├─ content/snapshot.json  Offline fallback content (committed, rebuilt on build)
└─ lib/
   ├─ db.ts             Prisma client, fail-fast connection settings
   ├─ resilient.ts      Cache → database → snapshot read path
   ├─ snapshot.ts       Typed access to the compiled-in snapshot
   ├─ refresh.ts        Clears both caches after an admin write
   ├─ auth.ts           Session cookies (JWT) + requireAdmin guard
   ├─ password.ts       scrypt hashing, free of Next imports so seed can use it
   ├─ schedule.ts       IST-safe timetable logic
   ├─ queries.ts        All public reads, each with a snapshot fallback
   └─ format.ts         Phone, address and date formatting
```

### The schedule engine

A visiting consultant's patients constantly ask *which hospital is he at
today?* — and neither Practo nor any single hospital page can answer it,
because each only knows about itself. `lib/schedule.ts` answers it.

All reasoning happens in **Asia/Kolkata**, not server time, so a server running
in UTC never shows the wrong day. Marking leave under **Admin → Leave &
holidays** removes that OPD everywhere on the site at once.

### Admin panel

| Section | Controls |
| --- | --- |
| Dashboard | Today's schedule, new requests, pre-launch checklist |
| Appointments | Request inbox — confirm, complete, cancel, internal notes |
| Locations & timings | Addresses, fees, booking links, weekly OPD sessions |
| Leave & holidays | One-off closures, per location or a full day off |
| Conditions | The SEO landing pages, with per-page search title/description |
| Services | CGM, insulin pump therapy, counselling |
| Credentials | Degrees, positions, memberships, awards |
| FAQs | General, or attached to a specific condition |
| Testimonials | Publishing is blocked until consent is recorded |
| Photos | Upload and delete images |
| Site settings | Name, contact details, home page text, announcement banner |
| Account | Change email and password |

---

## Deploying

### 1. Railway — the database

Create a Postgres service and copy `DATABASE_PUBLIC_URL`. Then, once:

```bash
DATABASE_URL="<railway url>" npm run db:push
DATABASE_URL="<railway url>" npm run db:seed
```

### 2. Vercel — the app

Already linked to the project `drpawangoel`. Deploy with:

```bash
vercel --prod
```

Three environment variables are set for production, preview and development:
`DATABASE_URL`, `SESSION_SECRET` and `NEXT_PUBLIC_SITE_URL`.

> **Setting env vars from PowerShell:** do not pipe values into
> `vercel env add`. PowerShell prepends a UTF-8 BOM, which silently corrupts
> the value — a BOM in `DATABASE_URL` breaks the connection while the site
> still appears to work, because reads fall back to the snapshot. Write the
> value to a file with `UTF8Encoding($false)` and redirect it into stdin
> instead.

### 3. Checking a deployment

`/media/<anything>` is a quick database health probe:

- **404** — Postgres is reachable, the row simply doesn't exist
- **503** — Postgres is unreachable, and the site is running on snapshot
  fallback

Page loads alone don't prove the database works, precisely because the
fallback is doing its job.

### 4. Checks before launch

- [ ] Verify every timing, fee and phone number with Dr. Goel
- [ ] Upload a professional portrait — the highest-impact item on this list
- [ ] Buy the domain and set `NEXT_PUBLIC_SITE_URL`
- [ ] Create a Google Business Profile for the Shalimar Bagh clinic
- [ ] Change the admin password
- [ ] Confirm HTTPS — the session cookie is `secure`, so login silently fails
      over plain HTTP

### Notes

- **Regions differ between providers.** Every query crosses from Vercel to
  Railway, so keep both as close as possible. The 60-second read cache absorbs
  most of the cost.
- **`npm audit` reports a high-severity advisory** in `deepmerge-ts`, reached
  through `@prisma/config`. It is a build-time CLI dependency, not shipped to
  production, and the only offered fix is a major Prisma downgrade.

---

## Compliance notes

Content is written to stay within the **NMC Code of Ethics** restrictions on
advertising by registered practitioners: factual and informational, with no
superlatives, no guaranteed outcomes and no comparative claims. Keep it that
way when editing.

- **Testimonials** cannot be published until consent is recorded.
- **The booking form** collects the minimum needed to schedule a call and tells
  patients not to send medical details through it — relevant under the **DPDP
  Act, 2023**.
- **Privacy policy, terms and a medical disclaimer** are published and linked
  in the footer.
- Any future teleconsultation feature is governed by the **Telemedicine
  Practice Guidelines, 2020**.
