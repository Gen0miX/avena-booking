// Période personnalisée stockée en base de données (Carnaval, etc.)
export interface PricingPeriod {
  id: number;
  apartment_id: string;
  name: string;
  start_date: string; // ISO date string "YYYY-MM-DD"
  end_date: string; // ISO date string "YYYY-MM-DD"
  // Prix par nuit (CHF) selon le nombre total de personnes, enfants compris
  price_up_to_2: number;
  price_up_to_4: number;
  price_up_to_6: number; // borné par la capacité de l'appartement
  created_at?: string;
  updated_at?: string;
}

export interface PricingPeriodInput {
  apartment_id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_up_to_2: number;
  price_up_to_4: number;
  price_up_to_6: number;
}

export const PERIOD_PRICE_FIELDS = [
  "price_up_to_2",
  "price_up_to_4",
  "price_up_to_6",
] as const;

/** Prix d'une nuit dans une période spéciale, même paliers que la grille saisonnière. */
export function getPeriodPrice(period: PricingPeriod, guests: number): number {
  if (guests <= 2) return period.price_up_to_2;
  if (guests <= 4) return period.price_up_to_4;
  return period.price_up_to_6;
}

/**
 * Valide et normalise le corps d'une requête de création / modification de
 * période (n'écrit que les colonnes connues en base).
 */
export function parsePricingPeriodInput(
  body: unknown,
): { data: PricingPeriodInput; error: null } | { data: null; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const start_date = typeof b.start_date === "string" ? b.start_date : "";
  const end_date = typeof b.end_date === "string" ? b.end_date : "";
  const apartment_id = typeof b.apartment_id === "string" ? b.apartment_id : "";
  if (!name || !start_date || !end_date || !apartment_id) {
    return { data: null, error: "Champs requis manquants" };
  }
  if (end_date <= start_date) {
    return { data: null, error: "La date de fin doit être après la date de début" };
  }
  const prices = PERIOD_PRICE_FIELDS.map((f) => Number(b[f]));
  if (prices.some((p) => !Number.isInteger(p) || p <= 0)) {
    return { data: null, error: "Les trois prix doivent être des montants entiers positifs" };
  }
  const [price_up_to_2, price_up_to_4, price_up_to_6] = prices;
  return {
    data: { apartment_id, name, start_date, end_date, price_up_to_2, price_up_to_4, price_up_to_6 },
    error: null,
  };
}

export type SeasonKey = "hiver" | "ete";

/**
 * Détermine la saison applicable pour une date donnée (récurrent chaque
 * année) : hiver de décembre à avril, été de mai à novembre. Les tarifs
 * associés sont définis dans config/apartments.ts — cette fonction ne
 * connaît que le calendrier.
 */
export function getSeasonKeyForDate(date: Date): SeasonKey {
  const month = date.getMonth(); // 0-11
  return month === 11 || month <= 3 ? "hiver" : "ete";
}
