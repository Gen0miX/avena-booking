# Multi-appartements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn avena-booking from a mono-appartement app into a multi-appartement app (2 units today, N tomorrow), with zero behavior change for the existing unit.

**Architecture:** A single code file (`config/apartments.ts`) is the source of truth for each apartment's content and business rules (capacity, min nights, default seasonal rates, gallery, description, amenities). The DB only needs to know *that* an apartment exists (`apartments` table, id = slug) so `bookings`, `pricing_periods`, `settings`, `promo_code` can carry a `apartment_id` FK. Every API route, hook, and page that touches one of those four tables is scoped by `apartment_id`. The public site gains a `/appartements/[slug]` page per unit; `/` becomes a hero + apartment-cards hub. The admin dashboard gains an apartment switcher (plus "Tous les appartements" for bookings list and statistics).

**Tech Stack:** Next.js 16 (App Router) + TypeScript, Supabase (Postgres + RLS), SWR, Tailwind/DaisyUI. No test runner exists in this repo (no jest/vitest/playwright in package.json) — verification is `npm run lint`, `npx tsc --noEmit` (or `npm run build`), and a manual QA pass, per the user's explicit process instructions. Steps below use that in place of "write a failing test."

**Spec:** this plan was written directly from the user's brief in-conversation (no separate spec file). Key decisions locked in during planning (see "Decisions" below) were confirmed with the user via AskUserQuestion on 2026-10-16.

## Decisions

- **Slugs:** `avena-1` (existing unit) and `avena-2` (new unit). Stable forever, stored as the primary key of the `apartments` table.
- **Pricing tiers:** today's 2-field model (`price_standard` ≤4 adults / `price_five` =5 adults) is generalized to a sorted list of `{ minAdults, price }` tiers per season, per apartment. For `avena-1` this is a mechanical re-expression of the existing values (zero behavior change — see Task 3). For `avena-2` (capacity 6) a 4th tier for 6 people is added now, with a clearly-flagged `TODO` price (currently mirrors the 5-person price so the app never computes `NaN`/0, but the client must set the real price before go-live).
- **Custom pricing periods** (the `pricing_periods` DB table an admin can create, e.g. "Carnaval") keep their existing 2-column shape (`price_standard`, `price_five`) — redesigning that table to arbitrary tiers was not requested. The generalization used is: `adults >= apartment.capacity → price_five`, else `price_standard`. For `avena-1` (capacity 5) this is byte-for-byte identical to today's `adults === 5` check. For `avena-2` (capacity 6) it means a custom period's top rate only kicks in at the full 6 guests; 5 guests get the mid rate. This is flagged in `docs/multi-appartements.md` as a known simplification the client can revisit later.
- **Admin apartment selector:** offers each apartment plus "Tous les appartements". Bookings/Terminated tabs: "Tous" shows every booking with an apartment column; a specific apartment filters. Settings/Pricing tabs: always require one specific apartment (no "Tous" — there's nothing to show). Statistics tab: supports a true aggregate view across apartments, per spec.
- **Hero CTA:** `components/home/Hero.tsx` is building-level (unchanged content, per the client's decision to keep one brand). Its "Réserver" button can no longer deep-link straight to `/booking` since there is no single default apartment anymore — it now links to the `#appartements` anchor on `/` so the visitor picks a unit first.
- **Promo codes have no admin UI today** — they're inserted directly in the database (no `components/admin/*promo*` screen exists, confirmed by search). The spec item "le sélecteur d'appartement filtre... les codes promo" therefore has nothing to filter in the admin UI; what this plan delivers is DB-level scoping (`apartment_id` + unique-per-apartment index, Task 1) and apartment-aware validation (Task 6), so promo codes are correctly isolated per apartment at the data/API layer. Building a promo-code admin screen is new scope, not part of this migration — flag to the user separately if wanted.
- **Booking flow is one page, not one per apartment:** `/booking` has a single apartment picker built into the form itself (not a separate route per unit). Visiting it from `/appartements/[slug]`'s "Réserver" button pre-selects that apartment via `?apartment=<slug>`; the visitor can then change their mind right there and the calendar/capacity/min-nights/price all re-scope live. Changing the selector updates the URL (`router.replace`) so a hard reload on `/booking?apartment=avena-2` still resolves the same apartment — satisfies "reste connu après un rechargement" without a redirect or a second route.

## Global Constraints

- Branch: all work happens on `dev` (already exists, created from `master`). Never commit/merge/push to `master`.
- No migration is ever executed by Claude. SQL lives under `supabase/migrations/<timestamp>_<name>.sql`, versioned, reviewed, and applied by the user (dev first, then prod at release time).
- Every migration must be safe to replay on prod data: backfill existing rows, never assume an empty table.
- `avena-1` behavior (prices, rules, emails, data) must stay byte-for-byte identical after this work. Any place this is at risk is called out explicitly in the task it appears in.
- One commit per task below, in order. After every task: `npm run lint`, `npx tsc --noEmit`, `npm run build` must all pass before moving on.
- No secrets committed. `.env.local` is already git-ignored — do not touch it except to read variable *names* if ever needed, never values.

## Review Focus

- **Cross-apartment calendar leakage:** a booking on `avena-2` must never show as an occupied date on `avena-1`'s calendar (and vice-versa). Covered by Task 5 (`occupied-dates` scoping) and manually re-checked in Task 16.
- **Promo code collision:** the same code name used by both apartments must validate independently (e.g. `avena-1` could deactivate "HIVER2027" while `avena-2` keeps it active). Covered by the unique-per-apartment index in Task 1 and the scoped query in Task 6.
- **Pricing-period overlap false positives:** creating "Carnaval" for `avena-2` must not be rejected because `avena-1` already has a "Carnaval" period on the same dates. Covered by Task 6 (overlap query scoped by `apartment_id`).
- **Unknown/garbage apartment slug:** any API hit with a slug that isn't in `config/apartments.ts` (typo, stale bookmark, scraping bot) must return a clear 400/404, not a 500 or — worse — silently fall back to `avena-1`'s data. Covered by `getApartmentBySlug` validation added to every route in Tasks 4–8 and the `notFound()` call in Task 11.
- **Price integrity on booking submission:** today nothing server-side recomputes price, checks capacity/min-nights, or checks date overlap before inserting a booking — the client is fully trusted. This is flagged explicitly in the brief as something to fix as part of this migration (not an unrelated bonus). Covered by Task 4.

---

## Task 1: Database migrations

**Files:**
- Create: `supabase/migrations/20261016120000_create_apartments.sql`
- Create: `supabase/migrations/20261016120100_add_apartment_id.sql`
- Create: `supabase/migrations/20261016120200_seed_avena2_settings.sql`

**Interfaces:**
- Produces: `public.apartments(id text PK, name text, created_at timestamptz)` with rows `avena-1`, `avena-2`. `bookings`, `pricing_periods`, `settings`, `promo_code` each gain a required `apartment_id text references apartments(id)`.

These three files must be applied **in this order** (the timestamp prefixes already sort correctly for `supabase migration up` / `supabase db push`). Nothing here is executed by Claude — the user applies these themselves, dev first.

- [ ] **Step 1: `20261016120000_create_apartments.sql`**

```sql
create table if not exists public.apartments (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.apartments enable row level security;

create policy "Public can read apartments" on public.apartments
  for select using (true);

-- Seed both known apartments. "name" here is just a human-readable label for
-- SQL-side debugging/admin convenience; the real display content (address,
-- gallery, rates, ...) lives in config/apartments.ts, not in this table.
insert into public.apartments (id, name) values
  ('avena-1', 'Avena 1'),
  ('avena-2', 'Avena 2')
on conflict (id) do nothing;
```

- [ ] **Step 2: `20261016120100_add_apartment_id.sql`**

```sql
-- bookings
alter table public.bookings add column if not exists apartment_id text;
update public.bookings set apartment_id = 'avena-1' where apartment_id is null;
alter table public.bookings alter column apartment_id set not null;
alter table public.bookings
  add constraint bookings_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_bookings_apartment_id on public.bookings (apartment_id);

-- pricing_periods
alter table public.pricing_periods add column if not exists apartment_id text;
update public.pricing_periods set apartment_id = 'avena-1' where apartment_id is null;
alter table public.pricing_periods alter column apartment_id set not null;
alter table public.pricing_periods
  add constraint pricing_periods_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_pricing_periods_apartment_id on public.pricing_periods (apartment_id);

-- settings
alter table public.settings add column if not exists apartment_id text;
update public.settings set apartment_id = 'avena-1' where apartment_id is null;
alter table public.settings alter column apartment_id set not null;
alter table public.settings
  add constraint settings_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
-- exactly one settings row per apartment
create unique index if not exists idx_settings_apartment_id_unique on public.settings (apartment_id);

-- promo_code
alter table public.promo_code add column if not exists apartment_id text;
update public.promo_code set apartment_id = 'avena-1' where apartment_id is null;
alter table public.promo_code alter column apartment_id set not null;
alter table public.promo_code
  add constraint promo_code_apartment_id_fkey
  foreign key (apartment_id) references public.apartments(id);
create index if not exists idx_promo_code_apartment_id on public.promo_code (apartment_id);
-- a code name is unique per apartment, not globally; case-insensitive to match
-- the existing .ilike() lookup in app/api/promo/validate/route.ts
create unique index if not exists idx_promo_code_apartment_name_unique
  on public.promo_code (apartment_id, upper(name));
```

Note on RLS: every existing policy on these four tables is role-based (`authenticated`/`public`), not row-based, so none of them need to change for this migration — adding a NOT NULL FK column doesn't interact with `USING (true)`-style policies. Double-check this holds after Step 2 is applied in dev (a policy referencing a specific column list would need updating; none currently do — confirmed by reading `supabase/schema_prod.sql`).

- [ ] **Step 3: `20261016120200_seed_avena2_settings.sql`**

```sql
-- avena-2 needs its own settings row (one-row-per-apartment is enforced by
-- the unique index above). Use the same default the app already falls back
-- to in code (lib/settings.ts DEFAULT_BOOKING_BLOCKED_AFTER) so behavior is
-- identical whether or not this row exists.
insert into public.settings (apartment_id, booking_blocked_after)
values ('avena-2', '2028-10-31')
on conflict (apartment_id) do nothing;
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations
git commit -m "feat(db): add apartments table and apartment_id to booking-related tables"
```

(These files are committed but **not run** by Claude. The user runs them against the dev Supabase project, verifies, then re-runs the same files against prod at release time — see `docs/multi-appartements.md`, Task 17.)

---

## Task 2: Apartment configuration file

**Files:**
- Create: `config/apartments.ts`
- Modify: `lib/pricingPeriods.ts` (remove `DEFAULT_RATES`/`DefaultRate`/`getDefaultRateForDate`, keep `PricingPeriod`/`PricingPeriodInput` but add `apartment_id: string`, add a new shared `SeasonKey` type + `getSeasonKeyForDate`)

**Interfaces:**
- Produces: `ApartmentConfig`, `ApartmentSlug`, `RateTier`, `APARTMENTS`, `APARTMENT_LIST`, `getApartmentBySlug(slug: string): ApartmentConfig | undefined`, `isApartmentSlug(slug: string): slug is ApartmentSlug`.
- Consumes: `SeasonKey`, `getSeasonKeyForDate(date: Date): SeasonKey` from `lib/pricingPeriods.ts`.

- [ ] **Step 1: Extract season-boundary logic into `lib/pricingPeriods.ts`**

Replace the current `DefaultRate`/`DEFAULT_RATES`/`getDefaultRateForDate` block (lines 21-95) with:

```ts
export type SeasonKey = "basseSaison" | "novembre" | "hiver" | "fetes";

/**
 * Détermine la saison applicable pour une date donnée (récurrent chaque
 * année). Les tarifs associés à chaque saison sont définis par appartement
 * dans config/apartments.ts — cette fonction ne connaît que le calendrier.
 */
export function getSeasonKeyForDate(date: Date): SeasonKey {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  if (month === 11 && day >= 18) return "fetes";
  if (month === 0 && day <= 10) return "fetes";

  if (month === 0 && day >= 11) return "hiver";
  if (month >= 1 && month <= 3) return "hiver";

  if (month >= 4 && month <= 9) return "basseSaison";

  if (month === 10) return "novembre";

  if (month === 11 && day < 18) return "hiver";

  return "basseSaison";
}
```

Keep `PricingPeriod`/`PricingPeriodInput` at the top of the file, adding the new required field to both:

```ts
export interface PricingPeriod {
  id: number;
  apartment_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_standard: number;
  price_five: number;
  created_at?: string;
  updated_at?: string;
}

export interface PricingPeriodInput {
  apartment_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_standard: number;
  price_five: number;
}
```

- [ ] **Step 2: Create `config/apartments.ts`**

```ts
import { SeasonKey } from "@/lib/pricingPeriods";

export interface RateTier {
  minAdults: number;
  price: number;
}

export type SeasonRates = Record<SeasonKey, RateTier[]>;

export interface ApartmentGalleryImage {
  src: string;
  alt: string;
}

export interface ApartmentDescription {
  tagline: string;
  intro: string;
  capacityIntro: string;
  features: string[];
  locationIntro: string;
  winterHighlights: string[];
  summerHighlights: string[];
  locationOutro: string;
}

export interface ApartmentConfig {
  slug: "avena-1" | "avena-2";
  name: string;
  address: string;
  mapQuery: string;
  capacity: number; // max total travelers (adults + children) AND max adults for pricing tiers
  minNights: number;
  bedrooms: number | null;
  bathrooms: number | null;
  petsAllowed: boolean;
  defaultRates: SeasonRates;
  gallery: ApartmentGalleryImage[];
  amenities: string[];
  description: ApartmentDescription;
  /** false => UI must render "contenu à venir" placeholders instead of crashing on empty data. */
  isContentComplete: boolean;
}

function tiers(entries: [number, number][]): RateTier[] {
  return entries.map(([minAdults, price]) => ({ minAdults, price }));
}

export const AVENA_1: ApartmentConfig = {
  slug: "avena-1",
  name: "Avena 1",
  address: "Untere Dorfstrasse 39, 3906 Saas-Fee",
  mapQuery: "Avena, Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse",
  capacity: 5,
  minNights: 2,
  bedrooms: 2,
  bathrooms: 1,
  petsAllowed: false,
  defaultRates: {
    basseSaison: tiers([[1, 150], [3, 200], [5, 250]]),
    novembre: tiers([[1, 250], [5, 250]]),
    hiver: tiers([[1, 280], [5, 300]]),
    fetes: tiers([[1, 350], [5, 400]]),
  },
  gallery: [
    { src: "/images/appartements/salon.webp", alt: "Salon" },
    { src: "/images/appartements/cuisine.webp", alt: "Cuisine" },
    { src: "/images/appartements/chambre1.webp", alt: "Chambre 1" },
    { src: "/images/appartements/chambre2.webp", alt: "Chambre 2" },
    { src: "/images/appartements/balcony.webp", alt: "Balcon" },
  ],
  amenities: [
    "Wi-Fi",
    "Écran",
    "Four",
    "Frigo",
    "Plaques",
    "Machine Nespresso",
    "Lave-vaisselle",
    "Salle de bain (douche)",
    "Rangements",
    "Sèche-cheveux",
    "Balcon",
    "Non-fumeur",
  ],
  description: {
    tagline: "Un séjour comme à la maison, à Saas-Fee",
    intro:
      "Vous cherchez une location d'appartement à Saas-Fee pour vos prochaines vacances en montagne ? Découvrez notre hébergement tout confort situé à Untere Dorfstrasse 39, en plein cœur de la station piétonne de Saas-Fee, dans les Alpes valaisannes.",
    capacityIntro: "Cet appartement lumineux peut accueillir jusqu'à 5 personnes et dispose de :",
    features: [
      "Deux chambres spacieuses avec literie de qualité (possibilité d'ajouter un matelas et un duvet pour une 5ᵉ personne)",
      "Un salon chaleureux avec coin repas",
      "Une cuisine équipée (four, plaques, lave-vaisselle, machine à café)",
      "Une salle de bain",
      "Wi-Fi gratuit, écran, linge de lit et serviettes inclus",
    ],
    locationIntro: "Située à 1800 mètres d'altitude, Saas-Fee est une destination de choix pour un séjour en montagne en toute saison.",
    winterHighlights: [
      "Plus de 100 km de pistes de ski",
      "Snowpark, ski de fond, randonnées en raquettes",
      "Patinoire, pistes de luge, paysages enneigés à couper le souffle",
    ],
    summerHighlights: [
      "Randonnées panoramiques dans les Alpes suisses",
      "Activités en plein air : VTT, via ferrata, tyrolienne",
      "Découverte du patrimoine local et gastronomie valaisanne",
    ],
    locationOutro:
      "Notre appartement bénéficie d'un emplacement central idéal, à seulement 5 minutes à pied de l'arrêt de bus et 10 minutes du parking principal. Vous pouvez ainsi profiter pleinement de tout ce que Saas-Fee a à offrir, sans contrainte de transport.",
  },
  isContentComplete: true,
};

export const AVENA_2: ApartmentConfig = {
  slug: "avena-2",
  name: "Avena 2",
  // TODO(client): confirmer l'adresse exacte de ce 2e appartement dans l'immeuble.
  address: "Untere Dorfstrasse 39, 3906 Saas-Fee",
  mapQuery: "Avena, Untere Dorfstrasse 39, 3906 Saas-Fee, Suisse",
  capacity: 6,
  minNights: 2,
  bedrooms: null, // TODO(client)
  bathrooms: null, // TODO(client)
  petsAllowed: false, // TODO(client): confirmer
  defaultRates: {
    // Paliers 1/3/5 repris à l'identique d'Avena 1 (décision client). Le
    // palier 6 personnes est un placeholder aligné sur le palier 5 en
    // attendant un tarif définitif — TODO(client) avant mise en prod.
    basseSaison: tiers([[1, 150], [3, 200], [5, 250], [6, 250]]),
    novembre: tiers([[1, 250], [5, 250], [6, 250]]),
    hiver: tiers([[1, 280], [5, 300], [6, 300]]),
    fetes: tiers([[1, 350], [5, 400], [6, 400]]),
  },
  gallery: [], // TODO(client): photos à ajouter
  amenities: [], // TODO(client): équipements à lister
  description: {
    tagline: "TODO(client): accroche",
    intro: "TODO(client): description à rédiger",
    capacityIntro: "TODO(client)",
    features: [],
    locationIntro: "TODO(client)",
    winterHighlights: [],
    summerHighlights: [],
    locationOutro: "TODO(client)",
  },
  isContentComplete: false,
};

export const APARTMENTS = {
  "avena-1": AVENA_1,
  "avena-2": AVENA_2,
} as const;

export type ApartmentSlug = keyof typeof APARTMENTS;
export const APARTMENT_LIST: ApartmentConfig[] = Object.values(APARTMENTS);

export function getApartmentBySlug(slug: string): ApartmentConfig | undefined {
  return (APARTMENTS as Record<string, ApartmentConfig>)[slug];
}

export function isApartmentSlug(slug: string): slug is ApartmentSlug {
  return slug in APARTMENTS;
}

/** Tier lookup helper shared by priceCalculator: picks the highest tier whose minAdults <= adults. */
export function getTierPrice(tiersList: RateTier[], adults: number): number {
  let price = tiersList[0].price;
  for (const tier of tiersList) {
    if (adults >= tier.minAdults) price = tier.price;
  }
  return price;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: fails only on files not yet updated to match the new `lib/pricingPeriods.ts` shape (`utils/priceCalculator.ts`, `components/admin/settings/PricingPeriodsManager.tsx`) — confirm the error list is exactly those two files, nothing else.

- [ ] **Step 4: Commit**

```bash
git add config/apartments.ts lib/pricingPeriods.ts
git commit -m "feat(apartments): add per-apartment configuration (content + pricing + rules)"
```

---

## Task 3: Generalize price calculation and capacity rules

**Files:**
- Modify: `utils/priceCalculator.ts` (full rewrite of the pricing functions)
- Modify: `lib/bookings.ts` (add `apartment_id` to `Booking` and `BookingInput`, add `promo_code?: string` to `BookingInput` — needed for server-side price verification in Task 4)

**Interfaces:**
- Produces: `getPriceResult({ start, end, adults, customPeriods, apartment }): { price: number | null; error: string | null }`, `getCategory(adults: number, capacity: number): Category`, `getNights(start, end): number` (unchanged signature).
- Consumes: `ApartmentConfig` from `config/apartments.ts`, `getSeasonKeyForDate`/`PricingPeriod` from `lib/pricingPeriods.ts`, `getTierPrice` from `config/apartments.ts`.

- [ ] **Step 1: Rewrite `utils/priceCalculator.ts`**

```ts
import { PricingPeriod } from "@/lib/pricingPeriods";
import { getSeasonKeyForDate } from "@/lib/pricingPeriods";
import { ApartmentConfig, getTierPrice } from "@/config/apartments";

type PriceParams = {
  start?: Date;
  end?: Date;
  adults: number;
  customPeriods?: PricingPeriod[];
  apartment: ApartmentConfig;
};

export type Category = string;

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNights(start: Date, end: Date): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  const startDay = stripTime(start);
  const endDay = stripTime(end);
  return Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / msPerNight));
}

function findCustomPeriodForDate(date: Date, customPeriods: PricingPeriod[]): PricingPeriod | null {
  const dateStr = formatDateToString(date);
  for (const period of customPeriods) {
    if (dateStr >= period.start_date && dateStr < period.end_date) {
      return period;
    }
  }
  return null;
}

function getPriceForDate(
  date: Date,
  adults: number,
  customPeriods: PricingPeriod[],
  apartment: ApartmentConfig,
): number {
  const customPeriod = findCustomPeriodForDate(date, customPeriods);
  if (customPeriod) {
    // pricing_periods keeps its legacy 2-tier shape (price_standard / price_five);
    // the top rate applies once adults reaches the apartment's full capacity.
    return adults >= apartment.capacity ? customPeriod.price_five : customPeriod.price_standard;
  }

  const seasonKey = getSeasonKeyForDate(date);
  const seasonTiers = apartment.defaultRates[seasonKey];
  return getTierPrice(seasonTiers, adults);
}

function calculatePrice(
  start: Date,
  end: Date,
  adults: number,
  customPeriods: PricingPeriod[],
  apartment: ApartmentConfig,
): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  let total = 0;
  while (cur.getTime() < endDay.getTime()) {
    total += getPriceForDate(cur, adults, customPeriods, apartment);
    cur = new Date(cur.getTime() + msPerNight);
  }

  return total;
}

export function getCategory(adults: number, capacity: number): Category {
  if (adults <= 2) return "1-2 adultes";
  if (adults < capacity) return "Famille";
  return `Plein (${capacity} adultes)`;
}

export function getPriceResult({
  start,
  end,
  adults,
  customPeriods = [],
  apartment,
}: PriceParams): { price: number | null; error: string | null } {
  if (!start || !end) {
    return { price: null, error: null };
  }

  if (adults < 1) {
    return { price: null, error: "Il faut au moins un adulte." };
  }

  const nights = getNights(start, end);
  if (nights < apartment.minNights) {
    return {
      price: null,
      error: `Le minimum de séjour est de ${apartment.minNights} nuits.`,
    };
  }

  if (adults > apartment.capacity) {
    return {
      price: null,
      error: `Le nombre maximum d'adultes est ${apartment.capacity}.`,
    };
  }

  const price = calculatePrice(start, end, adults, customPeriods, apartment);

  return { price, error: null };
}
```

Behavior check for `avena-1` (capacity 5): `adults > 5` error message is identical (`"Le nombre maximum d'adultes est 5."`), `nights < 2` identical, and `getPriceForDate` tier lookup reproduces the exact previous `adults===5→price_five / adults<=2→price_couple / else price_standard` logic (verified season-by-season in Task 2's step 2).

- [ ] **Step 2: Update `lib/bookings.ts`**

```ts
export interface Booking {
  id: number;
  apartment_id: string;
  created_at: Date;
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  address?: string;
  postal_code?: string;
  city?: string;
  birthdate?: Date;
  no_adults: number;
  no_childs?: number;
  status: Status;
  arrival_date: Date;
  departure_date: Date;
  price: number;
  is_cleaning: boolean;
  is_paid: boolean;
}

export interface BookingInput {
  apartment_id: string;
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  address?: string;
  postal_code?: string;
  city?: string;
  birthdate?: string;
  no_adults: number;
  no_childs?: number;
  status: number;
  arrival_date: string;
  departure_date: string;
  price: number;
  is_cleaning: boolean;
  /** Optional promo code applied client-side; re-validated server-side (Task 4). */
  promo_code?: string;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: every remaining error is a call site that doesn't yet pass `apartment` to `getPriceResult`/`getCategory` or `apartment_id` in a `BookingInput` literal — i.e. the call sites fixed in Tasks 8–10. No error should originate inside `utils/priceCalculator.ts` or `lib/bookings.ts` themselves.

- [ ] **Step 4: Commit**

```bash
git add utils/priceCalculator.ts lib/bookings.ts
git commit -m "feat(pricing): make capacity, min-nights and seasonal rates apartment-aware"
```

---

## Task 4: Bookings API — scoping + real server-side validation

**Files:**
- Modify: `app/api/bookings/route.ts`
- Modify: `app/api/bookings/[id]/route.ts` (one-line select fix only — see Step 3)

**Interfaces:**
- Consumes: `getApartmentBySlug` (`config/apartments.ts`), `getPriceResult`/`getNights` (`utils/priceCalculator.ts`), `PricingPeriod` (`lib/pricingPeriods.ts`).
- Produces: `GET /api/bookings?apartment=<slug|all>` (defaults to `all` when the param is absent, for admin-dashboard backward compatibility), `POST /api/bookings` (body now requires `apartment_id`, optional `promo_code`), `GET /api/bookings/:id` now also returns `apartment_id`.

- [ ] **Step 1: `GET` — add optional apartment filter**

Replace lines 11-67 with:

```ts
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (apartmentParam && apartmentParam !== "all" && !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      apartment_id,
      created_at,
      fname,
      lname,
      mail,
      phone,
      address,
      postal_code,
      city,
      birthdate,
      no_adults,
      no_childs,
      arrival_date,
      departure_date,
      price,
      is_cleaning,
      is_paid,
      status (
        id,
        name
      )
    `
    )
    .order("arrival_date", { ascending: true });

  if (apartmentParam && apartmentParam !== "all") {
    query = query.eq("apartment_id", apartmentParam);
  }

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error },
      { status: 500 }
    );
  }

  const typedData: Booking[] = data.map((item) => ({
    ...item,
    arrival_date: new Date(item.arrival_date),
    departure_date: new Date(item.departure_date),
    status: Array.isArray(item.status) ? item.status[0] : item.status,
  }));

  return NextResponse.json(typedData);
}
```

(add `import { getApartmentBySlug } from "@/config/apartments";` and change the `GET()` signature to take `request: NextRequest` — it's already imported for `POST`.)

- [ ] **Step 2: `POST` — resolve apartment, validate capacity/min-nights/availability/price server-side**

Replace the body between reCAPTCHA success (after line 113) and the insert (before line 142) with:

```ts
    const supabase = await createClient();

    const apartment = getApartmentBySlug(bookingData.apartment_id);
    if (!apartment) {
      return NextResponse.json(
        { message: "Appartement inconnu" },
        { status: 400 }
      );
    }

    // Vérifier la date limite des réservations (par appartement)
    const { data: settingsData } = await supabase
      .from("settings")
      .select("booking_blocked_after")
      .eq("apartment_id", apartment.slug)
      .maybeSingle();

    const blockedAfter =
      settingsData?.booking_blocked_after || DEFAULT_BOOKING_BLOCKED_AFTER;

    if (blockedAfter) {
      const limitDate = new Date(blockedAfter);
      limitDate.setHours(23, 59, 59, 999);
      const arrivalDateObj = new Date(arrivalDate);

      if (arrivalDateObj > limitDate) {
        return NextResponse.json(
          {
            message: `Les réservations sont limitées jusqu'au ${new Date(blockedAfter).toLocaleDateString("fr-CH")}`,
          },
          { status: 400 }
        );
      }
    }

    // Règles de capacité / minimum de nuits, côté serveur (jusqu'ici non vérifiées)
    const arrivalDateObj2 = new Date(arrivalDate + "T00:00:00");
    const departureDateObj2 = new Date(departureDate + "T00:00:00");
    const nights = getNights(arrivalDateObj2, departureDateObj2);

    if (bookingData.no_adults > apartment.capacity) {
      return NextResponse.json(
        { message: `Le nombre maximum d'adultes est ${apartment.capacity}.` },
        { status: 400 }
      );
    }
    if (nights < apartment.minNights) {
      return NextResponse.json(
        { message: `Le minimum de séjour est de ${apartment.minNights} nuits.` },
        { status: 400 }
      );
    }

    // Disponibilité : aucune réservation active ne doit chevaucher ces dates,
    // et seulement pour ce même appartement (une résa sur avena-2 ne doit
    // jamais bloquer avena-1 et vice-versa).
    const { data: overlapping, error: overlapError } = await supabase
      .from("bookings")
      .select("id")
      .eq("apartment_id", apartment.slug)
      .neq("status", 4)
      .lt("arrival_date", departureDate)
      .gt("departure_date", arrivalDate);

    if (overlapError) {
      return NextResponse.json(
        { message: "Erreur lors de la vérification de disponibilité" },
        { status: 500 }
      );
    }
    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { message: "Ces dates ne sont plus disponibles pour cet appartement" },
        { status: 409 }
      );
    }

    // Prix : recalculé côté serveur à partir des règles de l'appartement,
    // puis (si un code promo est fourni) re-vérifié et réduit de la même
    // façon que côté client, pour ne jamais faire confiance au prix envoyé.
    const { data: customPeriods } = await supabase
      .from("pricing_periods")
      .select("*")
      .eq("apartment_id", apartment.slug);

    const { price: basePrice, error: priceError } = getPriceResult({
      start: arrivalDateObj2,
      end: departureDateObj2,
      adults: bookingData.no_adults,
      customPeriods: (customPeriods ?? []) as PricingPeriod[],
      apartment,
    });

    if (priceError || basePrice === null) {
      return NextResponse.json({ message: priceError ?? "Prix invalide" }, { status: 400 });
    }

    let expectedPrice = basePrice;
    const promoCodeInput = (bookingData as unknown as { promo_code?: string }).promo_code;
    if (promoCodeInput) {
      const normalized = promoCodeInput.trim().toUpperCase();
      const { data: promo } = await supabase
        .from("promo_code")
        .select("percentage, active")
        .eq("apartment_id", apartment.slug)
        .ilike("name", normalized)
        .maybeSingle();

      if (promo?.active) {
        expectedPrice = Math.max(0, Math.round(basePrice * (1 - Number(promo.percentage) / 100)));
      }
    }

    if (Math.round(bookingData.price) !== expectedPrice) {
      return NextResponse.json(
        { message: "Le prix de la réservation ne correspond pas au tarif attendu" },
        { status: 400 }
      );
    }

    const { promo_code: _promoCode, ...bookingDataForInsert } = bookingData as BookingInput & {
      promo_code?: string;
    };
```

Then change the insert (current lines 142-152) to use `bookingDataForInsert` instead of `bookingData`:

```ts
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingDataForInsert,
          arrival_date: arrivalDate,
          departure_date: departureDate,
        },
      ])
      .select()
      .single();
```

(`promo_code` is not a column on `bookings` — it must be stripped before insert, which `bookingDataForInsert` does.)

Add the two new imports at the top:

```ts
import { getApartmentBySlug } from "@/config/apartments";
import { getPriceResult, getNights } from "@/utils/priceCalculator";
import { PricingPeriod } from "@/lib/pricingPeriods";
```

- [ ] **Step 3: `app/api/bookings/[id]/route.ts` GET — add `apartment_id` to the select**

`Booking` (as of Task 3) now has a required `apartment_id: string` field, but this single-booking `GET` (used by `hooks/useBooking.ts`, which backs the confirmation page and the admin booking-detail view) never selects that column — add it to the existing `select(...)` template literal (lines 15-38), right after `id,`:

```ts
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      apartment_id,
      created_at,
      fname,
      lname,
      mail,
      phone,
      address,
      postal_code,
      city,
      birthdate,
      no_adults,
      no_childs,
      arrival_date,
      departure_date,
      price,
      is_cleaning,
      is_paid,
      status (
        id,
        name
      )
    `
    )
    .eq("id", parsedId)
    .single();
```

No other change to this file — `PUT`/`DELETE` already operate generically on `updates`/`id` and need nothing added.

- [ ] **Step 4: Verify manually**

Run: `npm run build`
Then manually (dev server, dev Supabase project): submit one booking for `avena-1` with real dates/adults and confirm the price returned matches what the UI showed before this task (byte-identical CHF amount) — this is the regression check for "no behavior change for the existing apartment."

- [ ] **Step 5: Commit**

```bash
git add app/api/bookings/route.ts "app/api/bookings/[id]/route.ts"
git commit -m "feat(bookings-api): scope bookings by apartment and validate capacity/min-nights/availability/price server-side"
```

---

## Task 5: Occupied-dates API — scoping

**Files:**
- Modify: `app/api/bookings/occupied-dates/route.ts`

**Interfaces:**
- Produces: `GET /api/bookings/occupied-dates?apartment=<slug>` (slug now required).

- [ ] **Step 1: Require and filter by `apartment`**

Replace lines 1-9 with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getApartmentBySlug } from "@/config/apartments";

export async function GET(request: NextRequest) {
  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (!apartmentParam || !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ message: "Appartement inconnu" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("arrival_date, departure_date")
    .eq("apartment_id", apartmentParam)
    .neq("status", 4);
```

(the rest of the function, lines 10-72, is unchanged — it already operates purely on `data`.)

- [ ] **Step 2: Commit**

```bash
git add app/api/bookings/occupied-dates/route.ts
git commit -m "feat(occupied-dates-api): scope occupied dates by apartment"
```

---

## Task 6: Pricing-periods and promo-code APIs — scoping

**Files:**
- Modify: `app/api/pricing-periods/route.ts`
- Modify: `app/api/pricing-periods/[id]/route.ts`
- Modify: `app/api/promo/validate/route.ts`

**Interfaces:**
- Produces: `GET /api/pricing-periods?apartment=<slug>` (required), `POST` body requires `apartment_id`; `PUT /api/pricing-periods/:id` body requires `apartment_id` (used only for the overlap check — the row's own apartment never changes); `POST /api/promo/validate` body requires `apartment_id`.

- [ ] **Step 1: `app/api/pricing-periods/route.ts` — GET**

Replace lines 8-24 with:

```ts
export async function GET(request: NextRequest) {
  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (!apartmentParam || !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pricing_periods")
    .select("*")
    .eq("apartment_id", apartmentParam)
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch pricing periods", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
```

Add `import { getApartmentBySlug } from "@/config/apartments";`.

- [ ] **Step 2: same file — POST, scope the overlap check**

In the overlap query (lines 65-69), add `.eq("apartment_id", body.apartment_id)`:

```ts
  if (!getApartmentBySlug(body.apartment_id)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  const { data: overlaps, error: overlapError } = await supabase
    .from("pricing_periods")
    .select("id, name")
    .eq("apartment_id", body.apartment_id)
    .lt("start_date", body.end_date)
    .gt("end_date", body.start_date);
```

Insert this apartment check right after the existing required-fields validation (line 54).

- [ ] **Step 3: `app/api/pricing-periods/[id]/route.ts` — PUT, scope the overlap check**

In the overlap query (lines 60-65), add `.eq("apartment_id", body.apartment_id)`:

```ts
  const { data: overlaps, error: overlapError } = await supabase
    .from("pricing_periods")
    .select("id, name")
    .eq("apartment_id", body.apartment_id)
    .neq("id", parsedId)
    .lt("start_date", body.end_date)
    .gt("end_date", body.start_date);
```

(`GET`/`DELETE` in this file need no change — they already operate on a single row by its own `id`.)

- [ ] **Step 4: `app/api/promo/validate/route.ts` — scope by apartment**

Add `apartment_id` to `ValidateRequestBody` (line 4-8), validate it, and scope the query (lines 84-88):

```ts
type ValidateRequestBody = {
  code: string;
  apartment_id: string;
  arrival_date: string;
  departure_date: string;
};
```

```ts
    const { arrival_date, departure_date, apartment_id } = body;

    if (!code || !arrival_date || !departure_date || !apartment_id) {
      return NextResponse.json(
        { active: false, reason: "Requête invalide" },
        { status: 400 }
      );
    }
    if (!getApartmentBySlug(apartment_id)) {
      return NextResponse.json(
        { active: false, reason: "Appartement inconnu" },
        { status: 400 }
      );
    }
```

```ts
    const { data, error } = await supabase
      .from("promo_code")
      .select("id, name, percentage, active")
      .eq("apartment_id", apartment_id)
      .ilike("name", normalized)
      .maybeSingle();
```

Add `import { getApartmentBySlug } from "@/config/apartments";` at the top.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` — expect remaining errors only in call sites (hooks/components) not yet updated.

- [ ] **Step 6: Commit**

```bash
git add app/api/pricing-periods app/api/promo
git commit -m "feat(pricing-periods-api,promo-api): scope by apartment, including overlap/uniqueness checks"
```

---

## Task 7: Settings API — scoping

**Files:**
- Modify: `app/api/settings/route.ts`

**Interfaces:**
- Produces: `GET /api/settings?apartment=<slug>` (required), `PUT /api/settings` body requires `apartment_id`.

- [ ] **Step 1: GET**

Replace lines 1-31 with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AppSettingsInput, DEFAULT_BOOKING_BLOCKED_AFTER } from "@/lib/settings";
import { getApartmentBySlug } from "@/config/apartments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (!apartmentParam || !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("apartment_id", apartmentParam)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      id: null,
      apartment_id: apartmentParam,
      booking_blocked_after: DEFAULT_BOOKING_BLOCKED_AFTER,
    });
  }

  return NextResponse.json(data);
}
```

(`maybeSingle()` returns `null` rather than throwing `PGRST116` when no row exists, so the old `error.code === "PGRST116"` branch is replaced by the `if (!data)` branch above — same fallback behavior, cleaner.)

- [ ] **Step 2: PUT**

Replace lines 34-106 with:

```ts
export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AppSettingsInput & { apartment_id: string } = await request.json();

  if (!getApartmentBySlug(body.apartment_id)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  if (body.booking_blocked_after) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.booking_blocked_after)) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez YYYY-MM-DD" },
        { status: 400 }
      );
    }
    const date = new Date(body.booking_blocked_after);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
  }

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .eq("apartment_id", body.apartment_id)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabase
      .from("settings")
      .update({
        booking_blocked_after: body.booking_blocked_after,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("settings")
      .insert([
        {
          apartment_id: body.apartment_id,
          booking_blocked_after: body.booking_blocked_after,
        },
      ])
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json(
      { error: "Failed to update settings", details: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
```

- [ ] **Step 3: Update `lib/settings.ts` types**

Add `apartment_id: string` to `AppSettings` and `AppSettingsInput` (lib/settings.ts lines 2-11).

- [ ] **Step 4: Commit**

```bash
git add app/api/settings/route.ts lib/settings.ts
git commit -m "feat(settings-api): scope settings by apartment"
```

---

## Task 8: Hooks — thread apartment through

**Files:**
- Modify: `hooks/usebookings.ts`
- Modify: `hooks/useOccupiedDates.ts`
- Modify: `hooks/usePricingPeriods.ts`
- Modify: `hooks/useSettings.ts`

**Interfaces:**
- Produces: `useBookings(apartmentId: string | "all", initialFilters?, key?)`, `useOccupiedDates(apartmentId: string | null)`, `usePricingPeriods(apartmentId: string | null)`, `useSettings(apartmentId: string | null)`. Passing `null` disables the SWR fetch (key becomes `null`) — used while a selector hasn't resolved an apartment yet.

- [ ] **Step 1: `hooks/usebookings.ts`**

Change the signature (line 31-34) and the SWR call (line 35):

```ts
export function useBookings(
  apartmentId: string | "all" = "all",
  initialFilters?: Partial<BookingFilters>,
  key: string = "default"
) {
  const url =
    apartmentId === "all" ? "/api/bookings" : `/api/bookings?apartment=${apartmentId}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
```

(everything else in the file is unchanged — it already operates on `data`.)

- [ ] **Step 2: `hooks/useOccupiedDates.ts`**

```ts
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useOccupiedDates(apartmentId: string | null) {
  const { data, error } = useSWR(
    apartmentId ? `/api/bookings/occupied-dates?apartment=${apartmentId}` : null,
    fetcher
  );

  return {
    dates: (data?.occupiedDates ?? []).map((d: string) => new Date(d)),
    loading: !!apartmentId && !data && !error,
    error,
  };
}
```

- [ ] **Step 3: `hooks/usePricingPeriods.ts`**

Change the SWR key (line 14-15) to `apartmentId ? `/api/pricing-periods?apartment=${apartmentId}` : null`, and the signature to `usePricingPeriods(apartmentId: string | null)`. In `createPeriod`/`updatePeriod` (lines 23-40, 42-58), merge `apartment_id: apartmentId` into the body before `JSON.stringify`.

- [ ] **Step 4: `hooks/useSettings.ts`**

Change the SWR key (line 14-15) to `apartmentId ? `/api/settings?apartment=${apartmentId}` : null`, signature to `useSettings(apartmentId: string | null)`. In `updateSettings` (lines 23-40), merge `apartment_id: apartmentId` into the body before `JSON.stringify`.

- [ ] **Step 5: Commit**

```bash
git add hooks
git commit -m "feat(hooks): thread apartment id through bookings/occupied-dates/pricing-periods/settings hooks"
```

---

## Task 9: Booking context + apartment resolution on the public site

**Files:**
- Modify: `context/BookingContext.tsx`

**Interfaces:**
- Produces: `BookingContextType` gains `apartmentSlug: ApartmentSlug | null` and `setApartmentSlug: (slug: ApartmentSlug | null) => void`.

- [ ] **Step 1: Extend the context**

```ts
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { Travelers } from "@/lib/bookings";
import { ApartmentSlug } from "@/config/apartments";

type BookingContextType = {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  travelers: Travelers;
  setTravelers: (travelers: Travelers) => void;
  apartmentSlug: ApartmentSlug | null;
  setApartmentSlug: (slug: ApartmentSlug | null) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [travelers, setTravelers] = useState<Travelers>({ adults: 1, children: 0 });
  const [apartmentSlug, setApartmentSlug] = useState<ApartmentSlug | null>(null);

  return (
    <BookingContext.Provider
      value={{ range, setRange, travelers, setTravelers, apartmentSlug, setApartmentSlug }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
```

- [ ] **Step 2: Commit**

```bash
git add context/BookingContext.tsx
git commit -m "feat(booking-context): carry the selected apartment through the booking flow"
```

---

## Task 10: Public apartment components become apartment-aware

**Files:**
- Modify: `components/home/Gallery.tsx`
- Modify: `components/home/Amenities.tsx`
- Modify: `components/home/ServiceBadges.tsx`
- Modify: `components/home/Disponibility.tsx`
- Modify: `components/TravelersSelector.tsx`
- Modify: `components/CustomDayPicker.tsx`
- Modify: `components/PopoverDatePicker.tsx` (only if it calls `useSettings`/`useOccupiedDates` directly — confirm while editing `CustomDayPicker.tsx`; otherwise skip)

**Interfaces:**
- Consumes: `ApartmentConfig` from `config/apartments.ts`.
- Produces: each component below takes a new required prop carrying apartment data/id; no component reads a hook with an implicit global apartment any more.

- [ ] **Step 1: `Gallery`, `Amenities`, `ServiceBadges` take `apartment: ApartmentConfig`**

`Gallery.tsx`: replace the hardcoded `images` constant (lines 5-11) with a prop `{ apartment }: { apartment: ApartmentConfig }` and use `apartment.gallery` everywhere `images` was used. When `apartment.gallery.length === 0`, render a simple "Galerie à venir" placeholder instead of the grid (avoid dividing by zero / indexing an empty array in the modal nav).

`Amenities.tsx`: replace the hardcoded `amenitiesList` (lines 31-50, including the icon per entry) with `{ apartment }: { apartment: ApartmentConfig }`; map `apartment.amenities` (strings only — icons were decorative, so render a generic bullet icon, e.g. `PiCheckCircle`, for every entry) and render "Équipements à venir" when the list is empty.

`ServiceBadges.tsx`: replace the hardcoded `texts` object (lines 20-25) with a `{ apartment }: { apartment: ApartmentConfig }` prop; derive the four badges from `apartment.bedrooms` (fallback "À venir" when `null`), `apartment.capacity`, `apartment.bathrooms` (fallback "À venir"), `apartment.petsAllowed` ("pas d'animaux" / "animaux acceptés").

- [ ] **Step 2: `TravelersSelector` takes `maxCapacity: number`**

Replace the hardcoded `5` (line 53, `const maxReached = total >= 5;`) and the static text (line 130, `"Maximum : 5 voyageurs (adultes + enfants)"`) with a new required prop:

```ts
export default function TravelersSelector({
  travelers,
  setTravelers,
  maxCapacity,
}: {
  travelers: Travelers;
  setTravelers: (val: Travelers) => void;
  maxCapacity: number;
}) {
  ...
  const maxReached = total >= maxCapacity;
  ...
  <p className="text-xs text-base-content/60">
    Maximum : {maxCapacity} voyageurs (adultes + enfants)
  </p>
```

Every call site (`Disponibility.tsx`, `app/booking/page.tsx`) must now pass `maxCapacity={apartment.capacity}` — fixed in Task 11.

- [ ] **Step 3: `Disponibility` takes `apartment: ApartmentConfig`**

```ts
export default function Disponibility({ apartment }: { apartment: ApartmentConfig }) {
  const router = useRouter();
  const { range, setRange, travelers, setTravelers } = useBooking();
  const { periods } = usePricingPeriods(apartment.slug);
  ...
  useEffect(() => {
    const { price, error } = getPriceResult({
      start: range?.from,
      end: range?.to,
      adults: travelers.adults,
      customPeriods: periods,
      apartment,
    });
    ...
  }, [range, travelers, periods, apartment]);

  const handleBookingClick = () => {
    if (range?.from && range?.to && travelers.adults > 0) {
      router.push(`/booking?apartment=${apartment.slug}`);
    } else {
      setDateError("Veuillez sélectionner une période et au moins un adulte.");
    }
  };
  ...
  <CustomDayPicker mode="readOnly" apartmentId={apartment.slug} />
  ...
  <TravelersSelector travelers={travelers} setTravelers={setTravelers} maxCapacity={apartment.capacity} />
```

- [ ] **Step 4: `CustomDayPicker` (and `PopoverDatePicker` if applicable) take `apartmentId: string`**

Add a required `apartmentId: string` prop; pass it into `useOccupiedDates(apartmentId)` and `useSettings(apartmentId)` wherever those hooks are currently called with no argument. Read the file first to get the exact current call sites (the Explore pass found them around lines 3-4 and 29-30) before editing, since line numbers may have shifted slightly since that pass.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` — remaining errors should only be in the pages that render these components without the new props yet (fixed in Task 11).

- [ ] **Step 6: Commit**

```bash
git add components/home/Gallery.tsx components/home/Amenities.tsx components/home/ServiceBadges.tsx components/home/Disponibility.tsx components/TravelersSelector.tsx components/CustomDayPicker.tsx components/PopoverDatePicker.tsx
git commit -m "feat(public-components): make gallery/amenities/badges/availability/day-picker apartment-aware"
```

---

## Task 11: `/appartements/[slug]` page, home page becomes a hub, sitemap

**Files:**
- Create: `app/appartements/[slug]/page.tsx`
- Modify: `app/page.tsx` (becomes hero + cards; the moved content lives in the new page)
- Create: `app/sitemap.ts`
- Modify: `components/home/Hero.tsx` (Réserver CTA target only)

**Interfaces:**
- Produces: `/appartements/avena-1`, `/appartements/avena-2` (each calls Next's `notFound()` for any other slug), `generateMetadata` per apartment, `/sitemap.xml` listing `/` and both apartment pages.

- [ ] **Step 1: Create `app/appartements/[slug]/page.tsx`**

This is a server component for metadata + `notFound()`, rendering a client component for the interactive parts (gallery/calendar/etc. all need client hooks). Structure:

```tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApartmentBySlug, APARTMENT_LIST } from "@/config/apartments";
import ApartmentPageClient from "./ApartmentPageClient";

export function generateStaticParams() {
  return APARTMENT_LIST.map((apartment) => ({ slug: apartment.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);
  if (!apartment) return {};
  return {
    title: `${apartment.name} — Avena`,
    description: apartment.description.intro,
  };
}

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);
  if (!apartment) notFound();

  return <ApartmentPageClient apartment={apartment} />;
}
```

Then `app/appartements/[slug]/ApartmentPageClient.tsx` carries exactly the body currently in `app/page.tsx` lines 38-161 (`NavBar`/scroll logic, the `<section id="home">` block with `Gallery`, `SectionTitle`, `ServiceBadges`, the description/features/location copy, `GoogleMapsEmbed`, `Disponibility`, `Footer`) **minus** the `<Hero />` — every hardcoded string from that block is replaced by the matching `apartment.*` field from `config/apartments.ts` (name → `apartment.name`, address → `apartment.address`, the five `<li>` features → `apartment.description.features.map(...)`, the map query → `apartment.mapQuery`, etc.), and `Gallery`/`Amenities`/`ServiceBadges`/`Disponibility` all receive `apartment={apartment}` per Task 10.

When `apartment.isContentComplete` is `false` (only `avena-2` today), render a visible "Contenu en cours de préparation" banner above the content instead of hiding sections — empty arrays already degrade gracefully per Task 10's placeholder handling, so nothing crashes either way.

- [ ] **Step 2: Rewrite `app/page.tsx` as the hub**

Keep the `NavBar` show/hide-on-scroll logic (lines 17-36) and `<Hero />` unchanged. Replace the `<section id="home">` block (lines 57-157) with an apartment-cards grid anchored at `#appartements`:

```tsx
<div className="bg-base-100 pt-16 sm:pt-20 pb-5">
  <section
    id="appartements"
    className="xl:max-w-6xl xl:mx-auto mx-1 sm:mx-5 scroll-mt-[72px] py-10"
  >
    <SectionTitle>Nos appartements</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {APARTMENT_LIST.map((apartment) => (
        <Link
          key={apartment.slug}
          href={`/appartements/${apartment.slug}`}
          className="card bg-base-200 border-2 border-primary/40 rounded-box overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="relative h-56 w-full bg-base-300">
            {apartment.gallery[0] ? (
              <Image
                src={apartment.gallery[0].src}
                alt={apartment.gallery[0].alt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/50">
                Photos à venir
              </div>
            )}
          </div>
          <div className="card-body">
            <h3 className="card-title">{apartment.name}</h3>
            <p className="text-sm text-base-content/70">{apartment.address}</p>
            <p className="text-sm text-base-content/70">Jusqu'à {apartment.capacity} personnes</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
</div>
<Footer />
```

Import `APARTMENT_LIST` from `@/config/apartments`, `Image` from `next/image`, `Link` from `next/link`. Drop the now-unused imports (`Gallery`, `ServiceBadges`, `Amenities`, `Disponibility`, `GoogleMapsEmbed`, `Tooltip`, `FaInfoCircle`) from this file.

- [ ] **Step 3: `Hero` CTA**

In `components/home/Hero.tsx`, change the "Réserver" `<Link href="/booking" ...>` (near the end of the file) to `<Link href="#appartements" ...>` since there's no longer a single default apartment to book from the hero.

- [ ] **Step 4: Create `app/sitemap.ts`**

```ts
import { MetadataRoute } from "next";
import { APARTMENT_LIST } from "@/config/apartments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.avena39.ch";
  return [
    { url: base, lastModified: new Date() },
    ...APARTMENT_LIST.map((apartment) => ({
      url: `${base}/appartements/${apartment.slug}`,
      lastModified: new Date(),
    })),
  ];
}
```

- [ ] **Step 5: Verify manually**

Run: `npm run dev`, then visit `/`, `/appartements/avena-1`, `/appartements/avena-2`, and `/appartements/does-not-exist` (expect the Next.js 404 page). Confirm `avena-1`'s page renders identical copy/images/map/calendar to what `/` used to show before this task.

- [ ] **Step 6: Commit**

```bash
git add app/appartements app/page.tsx app/sitemap.ts components/home/Hero.tsx
git commit -m "feat(public-site): add /appartements/[slug] pages, turn / into a hero+cards hub, add sitemap"
```

---

## Task 12: Booking page + confirmation page apartment wiring

**Files:**
- Modify: `app/booking/page.tsx`
- Modify: `app/confirmation/[id]/page.tsx`

**Interfaces:**
- Consumes: `getApartmentBySlug`, `isApartmentSlug`, `APARTMENT_LIST` (`config/apartments.ts`), `useSearchParams`/`useRouter` (`next/navigation`), `apartmentSlug`/`setApartmentSlug` from `useBooking()` (`context/BookingContext.tsx`, already added in Task 9).

There is **one** `/booking` page, not one per apartment. It shows an apartment picker inline; choosing a different apartment re-scopes the calendar, capacity, min-nights and price live, without navigating anywhere. The URL query param is kept in sync purely so a hard page reload doesn't lose the selection — it is not a second, redirect-driven route.

- [ ] **Step 1: `app/booking/page.tsx` gets an apartment selector that drives the rest of the page**

At the top of the component:

```ts
import { useSearchParams, useRouter } from "next/navigation";
import { APARTMENT_LIST, getApartmentBySlug, isApartmentSlug } from "@/config/apartments";

export default function Booking() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { range, setRange, travelers, setTravelers, apartmentSlug, setApartmentSlug } = useBooking();

  // Resolve the initial apartment once: URL param if valid, else the
  // first known apartment. Runs once on mount — afterwards the selector
  // below is the only thing that changes apartmentSlug.
  useEffect(() => {
    if (apartmentSlug) return;
    const fromUrl = searchParams.get("apartment");
    setApartmentSlug(isApartmentSlug(fromUrl ?? "") ? (fromUrl as typeof apartmentSlug) : APARTMENT_LIST[0].slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apartment = apartmentSlug ? getApartmentBySlug(apartmentSlug) : undefined;

  const handleApartmentChange = (slug: string) => {
    if (!isApartmentSlug(slug)) return;
    setApartmentSlug(slug);
    setRange(undefined); // dates picked for the previous apartment don't carry meaning here (different occupancy, possibly different capacity)
    router.replace(`/booking?apartment=${slug}`, { scroll: false });
  };

  if (!apartment) {
    return null; // one render tick while the mount effect above resolves the initial apartment
  }
  // ...rest of the component, unchanged structurally...
```

Render the selector inside the form, above the `TravelersSelector`/`PopoverDatePicker` block (near the existing "Données réservations" divider, around line 596-599):

```tsx
<div className="divider divider-start text-lg font-medium">
  Appartement
</div>
<select
  className="select select-primary w-full"
  value={apartment.slug}
  onChange={(e) => handleApartmentChange(e.target.value)}
>
  {APARTMENT_LIST.map((a) => (
    <option key={a.slug} value={a.slug}>
      {a.name} — jusqu'à {a.capacity} personnes
    </option>
  ))}
</select>

<div className="divider divider-start text-lg font-medium">
  Données réservations
</div>
```

(`useEffect` is already imported in this file.)

- [ ] **Step 2: Pass `apartment` everywhere `getPriceResult`/`getCategory`/`usePricingPeriods`/`TravelersSelector`/`CustomDayPicker` are called**

- Line 56: `const { periods } = usePricingPeriods(apartment.slug);` (re-fetches automatically whenever `apartment.slug` changes, since that's the SWR key per Task 8).
- Lines 190-195 and the second `getPriceResult` call: add `apartment` to the params object, and add `apartment.slug` to that `useEffect`'s dependency array so price recomputes immediately on apartment change.
- Line 647: `getCategory(travelers.adults)` → `getCategory(travelers.adults, apartment.capacity)`.
- Line 600-603 (`TravelersSelector`): add `maxCapacity={apartment.capacity}`.
- The two `CustomDayPicker` instances (readOnly one is only on `Disponibility`, not here — this page has the `mode="selectable"` one near the bottom, around line 746): add `apartmentId={apartment.slug}`.
- Line 245 (`fetch("/api/promo/validate", ...)`): add `apartment_id: apartment.slug` to the JSON body.
- Line 309-325 (`bookingData: BookingInput`): add `apartment_id: apartment.slug` and (if a promo was successfully validated) `promo_code: promoCode.trim()`.

Since switching apartments clears `range` (Step 1) but leaves `travelers` as-is, a traveler count that's invalid for the newly-selected apartment (e.g. 6 adults after switching from `avena-2` to `avena-1`) surfaces through the existing `priceError` alert exactly like any other invalid input — no extra handling needed.

- [ ] **Step 3: `app/confirmation/[id]/page.tsx` resolves the apartment from the booking's own `apartment_id`**

```ts
import { getApartmentBySlug } from "@/config/apartments";
```

After `const { booking, loading, error } = useBooking(bookingId);`, add:

```ts
const apartment = booking ? getApartmentBySlug(booking.apartment_id) : undefined;
```

Replace the hardcoded `"CH64 0076 8125 0290 8410 3"` / `"Réganély Noémie"` / address block (lines 104-108) with the apartment name added for clarity — the IBAN/creditor stay identical per the brief ("même IBAN et même créancier"), but add one line so the guest knows which unit they booked:

```tsx
<p className="mt-2">
  Appartement : <b>{apartment?.name ?? booking.apartment_id}</b>
</p>
<p className="mt-2">
  IBAN : <b>CH64 0076 8125 0290 8410 3</b>
  <br />
  Titulaire : <b>Réganély Noémie</b>
  <br />
  Adresse : <b>Ch. de Beaulieu 1, 1752 Villars-sur-Glâne</b>
</p>
```

- [ ] **Step 4: Verify manually**

Full booking flow dry run against the dev Supabase project: `/appartements/avena-1` → pick dates → "Réserver" → lands on `/booking?apartment=avena-1` with the selector pre-set to "Avena 1" and the right capacity/min-nights enforced → submit → confirmation page shows "Appartement : Avena 1". Then, without navigating away, reload `/booking?apartment=avena-1` directly and confirm the selector still shows "Avena 1". Separately, land on `/booking` with the selector, switch it from `avena-1` to `avena-2` by hand and confirm the calendar's disabled dates, the capacity cap, and the price all update immediately to `avena-2`'s rules — then submit a booking for `avena-2` (capacity 6 enforced, min 2 nights) and confirm its confirmation page shows "Appartement : Avena 2".

- [ ] **Step 5: Commit**

```bash
git add app/booking/page.tsx "app/confirmation/[id]/page.tsx"
git commit -m "feat(booking-flow): resolve and carry the apartment through booking and confirmation"
```

---

## Task 13: Admin — apartment selector in DashboardLayout

**Files:**
- Modify: `components/admin/DashboardLayout.tsx`
- Modify: `components/admin/BookingTable.tsx`
- Modify: `components/admin/BookingDetails.tsx`
- Modify: `components/admin/settings/SettingsPage.tsx`
- Modify: `components/admin/settings/GeneralSettings.tsx`
- Modify: `components/admin/settings/PricingPeriodsManager.tsx`
- Modify: `components/admin/settings/PricingPeriodForm.tsx`

**Interfaces:**
- Produces: a `selectedApartment: ApartmentSlug | "all"` state owned by `DashboardLayout`, passed down to every tab; `PricingPeriodsManager`/`GeneralSettings` receive a single required `apartmentSlug: ApartmentSlug` (never `"all"` — Settings/Pricing always need one concrete apartment).

- [ ] **Step 1: `DashboardLayout` owns the selector**

Add state and a header control:

```tsx
import { APARTMENT_LIST, ApartmentSlug } from "@/config/apartments";

type SelectedApartment = ApartmentSlug | "all";

export default function DashboardLayout({ onMenuClick, logoSrc, onLogout }: DashboardLayoutProps) {
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment>(
    APARTMENT_LIST[0].slug
  );
  // ...existing state...
```

In the header (around line 159, next to the page title), add:

```tsx
<select
  className="select select-sm select-primary"
  value={selectedApartment}
  onChange={(e) => setSelectedApartment(e.target.value as SelectedApartment)}
>
  {APARTMENT_LIST.map((apartment) => (
    <option key={apartment.slug} value={apartment.slug}>
      {apartment.name}
    </option>
  ))}
  <option value="all">Tous les appartements</option>
</select>
```

Thread it into `renderContent()`:

```tsx
case "bookings":
  return (
    <BookingTable
      key="current"
      onBookingSelect={handleBookingSelect}
      statusGroup="current"
      apartment={selectedApartment}
      initialFilters={bookingsFilters ?? undefined}
      onFiltersChange={setBookingsFilters as (f: BookingFilters) => void}
    />
  );
case "terminated":
  return (
    <BookingTable
      key="terminated"
      onBookingSelect={handleBookingSelect}
      statusGroup="terminated"
      apartment={selectedApartment}
      initialFilters={terminatedFilters ?? undefined}
      onFiltersChange={setTerminatedFilters as (f: BookingFilters) => void}
    />
  );
case "statistics":
  return <StatisticsDashboard apartment={selectedApartment} />;
case "settings":
  return selectedApartment === "all" ? (
    <div className="alert alert-info">
      Sélectionnez un appartement spécifique pour gérer ses paramètres.
    </div>
  ) : (
    <SettingsPage apartmentSlug={selectedApartment} />
  );
```

- [ ] **Step 2: `BookingTable` consumes `apartment`, shows a column when `"all"`**

Add `apartment: ApartmentSlug | "all"` to `BookingTableProps`; pass it as the first arg to `useBookings(apartment, initialFilters, statusGroup)` (line 44-52). When `apartment === "all"`, add an "Appartement" column to the desktop table (and a line to the mobile card) showing `getApartmentBySlug(booking.apartment_id)?.name ?? booking.apartment_id`.

- [ ] **Step 3: `BookingDetails` resolves and shows its own booking's apartment**

`BookingDetails` is opened by `bookingId`, not by the dashboard's selected apartment — a booking keeps belonging to whichever apartment it was made for, regardless of what's currently selected in the header dropdown. Resolve it from the booking itself:

```ts
import { getApartmentBySlug } from "@/config/apartments";
```

```ts
const apartment = booking ? getApartmentBySlug(booking.apartment_id) : undefined;
```

Display it next to the guest name (around line 271-274):

```tsx
<h1 className="text-2xl font-bold flex items-center gap-2">
  <FaUser />
  {booking.fname} {booking.lname}
</h1>
<p className="text-sm text-base-content/70">
  {apartment?.name ?? booking.apartment_id}
</p>
```

Thread `apartment` into the three places that currently assume a single global apartment:
- Line 38: `usePricingPeriods()` → `usePricingPeriods(booking?.apartment_id ?? null)`.
- Line 177: `getPriceResult({ start, end, adults, customPeriods: periods })` → add `apartment` (guard: skip the auto-price effect entirely if `!apartment`, since `getPriceResult` now requires it).
- Line 460-470 (`TravelersSelector`): add `maxCapacity={apartment?.capacity ?? 1}` (editing is disabled until `booking`/`apartment` resolve anyway, since the component returns the loading spinner at line 251-257 until then).

- [ ] **Step 4: `SettingsPage`, `GeneralSettings`, `PricingPeriodsManager`, `PricingPeriodForm` take `apartmentSlug: ApartmentSlug`**

`SettingsPage.tsx`: add `{ apartmentSlug }: { apartmentSlug: ApartmentSlug }` prop, pass to both children: `<PricingPeriodsManager apartmentSlug={apartmentSlug} />`, `<GeneralSettings apartmentSlug={apartmentSlug} />`.

`GeneralSettings.tsx`: add the same prop, pass to `useSettings(apartmentSlug)`.

`PricingPeriodsManager.tsx`: add the same prop, pass to `usePricingPeriods(apartmentSlug)`. Replace the "Tarifs par défaut" table (lines 99-148, currently reading the module-level `DEFAULT_RATES`) with a read of `getApartmentBySlug(apartmentSlug)!.defaultRates` and render one row per season using `getTierPrice`-style display (each tier on its own line, e.g. "1-2 pers. : 150 CHF / 3-4 pers. : 200 CHF / 5 pers. : 250 CHF / 6 pers. : 250 CHF" for `avena-2`) instead of the fixed 2-column layout, since the number of tiers now varies by apartment.

`PricingPeriodForm.tsx`: when submitting (`handleSubmit`/`onSubmit` call), include `apartment_id: apartmentSlug` in the payload passed to `createPeriod`/`updatePeriod` (both already accept it per Task 8's `PricingPeriodInput` change in Task 2).

- [ ] **Step 5: Verify manually**

In the admin dashboard: switch the selector between `avena-1`, `avena-2`, and "Tous les appartements"; confirm Bookings/Terminated lists filter correctly (and show the apartment column only in "Tous"), opening a booking's detail shows its own apartment name regardless of the current selector value, Settings/Pricing show a prompt instead of crashing when "Tous" is selected, and creating a pricing period under one apartment never collides with the other's dates.

- [ ] **Step 6: Commit**

```bash
git add components/admin
git commit -m "feat(admin): add apartment selector to DashboardLayout and scope bookings/settings/pricing tabs"
```

---

## Task 14: Statistics — per-apartment and global aggregate

**Files:**
- Modify: `components/admin/statistics/StatisticsDashboard.tsx`

**Interfaces:**
- Consumes: `apartment: ApartmentSlug | "all"` prop (new).
- No change needed in `lib/statistics.ts` — every function there already operates on whatever `Booking[]` array it's handed; scoping is achieved purely by which array `useBookings` returns.

- [ ] **Step 1: Accept and use the `apartment` prop**

```ts
export default function StatisticsDashboard({ apartment }: { apartment: ApartmentSlug | "all" }) {
  const { bookings, isLoading, isError } = useBookings(apartment);
  ...
```

That's the entire functional change — `useBookings(apartment)` already returns the apartment-scoped (or global, for `"all"`) booking list per Task 8, and every stat/chart downstream is computed from that array exactly as today.

- [ ] **Step 2: Add a small "Tous les appartements" indicator when aggregating**

Next to the "Statistiques" title (line 79), conditionally render:

```tsx
{apartment === "all" && (
  <span className="badge badge-outline">Vue globale — tous les appartements</span>
)}
```

- [ ] **Step 3: Verify manually**

Confirm occupancy/revenue/reservations/avg-stay numbers for a single apartment match what they were before this migration (byte-identical for `avena-1`, since its bookings are unchanged), and that "Tous les appartements" sums both units' bookings.

- [ ] **Step 4: Commit**

```bash
git add components/admin/statistics/StatisticsDashboard.tsx
git commit -m "feat(statistics): support per-apartment and global aggregate views"
```

---

## Task 15: Emails, QR invoice, Telegram — apartment name in content

**Files:**
- Modify: `lib/email.ts`
- Modify: `utils/emails/booking-email.tsx`
- Modify: `utils/emails/confirmation-email.tsx`
- Modify: `utils/emails/booking-cancel.tsx`
- Modify: `utils/qrInvoice.ts`
- Modify: `utils/telegram.ts`
- Modify: `app/api/bookings/route.ts`, `app/api/bookings/[id]/confirm/route.ts`, `app/api/bookings/[id]/cancel/route.ts`, `app/api/bookings/[id]/resend-email/route.ts` (pass the apartment name through to the functions above)

**Interfaces:**
- Produces: every email-sending function and `sendTelegramNotification` gain an `apartmentName: string` parameter; `createBookingQRBill` gains an `apartmentName: string` parameter folded into `unstructuredMessage`. Sender address and IBAN/creditor are **not parameterized** — per the brief, they stay identical across apartments.

- [ ] **Step 1: `lib/email.ts` — thread `apartmentName` through all three senders**

Add `apartmentName: string` to each function's parameter object (`sendBookingEmail`, `sendBookingConfirmationEmail`, `sendBookingCancellationEmail`), pass it to the corresponding email component (`BookingEmail`, `ConfirmationEmail`, `BookingCancel`), and to `createBookingQRBill`. Subjects gain the apartment name, e.g. line 40/127/169:

```ts
subject: `Votre réservation — ${apartmentName}`,
```

(`"noreply@avena39.ch"` sender stays untouched on all three, per the brief.)

- [ ] **Step 2: Email templates show which apartment**

In each of `booking-email.tsx`, `confirmation-email.tsx`, `booking-cancel.tsx`, add `apartmentName: string` to the props type and render it once, right under the "Bonjour {fname} {lname}," heading:

```tsx
<Text style={{ ...text, textAlign: "center" as const }}>
  Réservation — <b>{apartmentName}</b>
</Text>
```

- [ ] **Step 3: `utils/qrInvoice.ts` — apartment name in the payment reference**

Add `apartmentName: string` to `createBookingQRBill`'s parameter object (line 81-86) and fold it into `unstructuredMessage` (line 96):

```ts
export async function createBookingQRBill(bookingData: {
  fname: string;
  lname: string;
  price: number;
  bookingId: number;
  apartmentName: string;
}): Promise<Buffer> {
  ...
  unstructuredMessage: `Réservation #${bookingData.bookingId} - ${bookingData.apartmentName} - ${bookingData.fname} ${bookingData.lname}`,
```

(creditor block — name/address/IBAN — is untouched, per the brief.)

- [ ] **Step 4: `utils/telegram.ts` — apartment name in the notification text**

Add `apartmentName: string` to the `data` shape used by `sendTelegramNotification` and include it in both message templates (lines 46, 49):

```ts
case "booking":
  message = `📌 Nouvelle réservation (${data.apartmentName}) !\n\nNom: ${data.name}\nDate arrivée: ${data.arrival}\nDate départ: ${data.departure}`;
  break;
case "cancel":
  message = `⚠️ Réservation annulée (${data.apartmentName}) pour ${data.name}`;
  break;
```

(single shared `TELEGRAM_TOKEN`/`TELEGRAM_CHAT_ID` stays as-is — one channel for all apartments, per the brief.)

- [ ] **Step 5: Wire `apartmentName` at every call site**

In `app/api/bookings/route.ts`'s `POST` (after the insert succeeds), resolve `apartment.name` (already have `apartment` in scope from Task 4) and pass `apartmentName: apartment.name` to both `sendBookingEmail` and `sendTelegramNotification`.

In `app/api/bookings/[id]/confirm/route.ts` and `cancel/route.ts`, after fetching `bookingData` (which now includes `apartment_id` since it's `select("*")`), resolve the name via `getApartmentBySlug(bookingData.apartment_id)?.name ?? bookingData.apartment_id` and pass it through to `sendBookingConfirmationEmail`/`sendBookingCancellationEmail`/`sendTelegramNotification`.

In `app/api/bookings/[id]/resend-email/route.ts`, same pattern for whichever email function it calls.

- [ ] **Step 6: Verify manually**

Trigger one real booking + one cancel on the dev Supabase project for each apartment; confirm the received email subject/body and the Telegram message both name the correct apartment, the QR-bill reference line includes it, and the IBAN/creditor/sender are unchanged.

- [ ] **Step 7: Commit**

```bash
git add lib/email.ts utils/emails utils/qrInvoice.ts utils/telegram.ts app/api/bookings
git commit -m "feat(notifications): include the apartment name in emails, QR invoice and Telegram alerts"
```

---

## Task 16: Full regression pass

**Files:** none (verification only).

- [ ] **Step 1: Static checks**

Run, in order: `npm run lint`, `npx tsc --noEmit`, `npm run build`. All three must be clean.

- [ ] **Step 2: Manual QA — `avena-1` parity (must be byte-identical to pre-migration behavior)**

- `/appartements/avena-1` shows the exact same copy, gallery, amenities, map as the old `/`.
- Price for a known date range + adult count matches a value recorded before this migration started.
- Calendar correctly disables dates occupied by `avena-1` bookings only.
- Admin: `avena-1` bookings/settings/pricing-periods/statistics all show the pre-migration data.

- [ ] **Step 3: Manual QA — `avena-2` new behavior**

- `/appartements/avena-2` renders with all the "à venir" placeholders, doesn't crash.
- Booking `avena-2` enforces capacity 6 / min 2 nights; a 7th guest or a 1-night stay is rejected both client-side and (bypass the UI with a raw `fetch` to `/api/bookings`) server-side.
- A booking on `avena-2` does not appear as an occupied date on `avena-1`'s calendar, and vice-versa.
- A promo code created for `avena-1` does not validate against `avena-2`'s booking flow (and vice-versa), and the same code name can exist independently on both.
- Creating a `pricing_periods` row for `avena-2` on dates that already have an `avena-1` period does not get rejected as an overlap.
- Admin "Tous les appartements": bookings list shows both units with an apartment column; statistics aggregate both.

- [ ] **Step 4: Commit (only if Step 1-3 surfaced fixes)**

```bash
git add -A
git commit -m "fix: address regression-pass findings"
```

---

## Task 17: Documentation

**Files:**
- Create: `docs/multi-appartements.md`

- [ ] **Step 1: Write the doc**

Cover, concretely (not placeholders):

1. **Adding a new apartment** — the 3 required steps: (a) add an `ApartmentConfig` entry to `config/apartments.ts` with a slug that will never change; (b) add its photos under `public/images/appartements/<slug>/`; (c) insert one row into the `apartments` table (`insert into apartments (id, name) values ('<slug>', '<Name>');`) plus one `settings` row (`insert into settings (apartment_id, booking_blocked_after) values ('<slug>', null);`). Nothing else needs to change — every API route, hook, and page already generalizes over `config/apartments.ts`.
2. **Applying migrations at release time** — the exact file list and order from Task 1 (`20261016120000_create_apartments.sql`, then `..._add_apartment_id.sql`, then `..._seed_avena2_settings.sql`), run first against the dev Supabase project (already done during this plan's execution), then re-run the same files against the prod project via `supabase db push` (or the Supabase dashboard SQL editor) at go-live — never against prod before dev has been verified.
3. **Manual test checklist** — copy the bullet list from Task 16, Steps 2-3, verbatim, as the pre-release checklist.

- [ ] **Step 2: Commit**

```bash
git add docs/multi-appartements.md
git commit -m "docs: document how to add an apartment and apply migrations at release time"
```
