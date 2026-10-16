// Période personnalisée stockée en base de données (Carnaval, etc.)
export interface PricingPeriod {
  id: number;
  apartment_id: string;
  name: string;
  start_date: string; // ISO date string "YYYY-MM-DD"
  end_date: string; // ISO date string "YYYY-MM-DD"
  price_standard: number; // Prix pour <=4 adultes (CHF)
  price_five: number; // Prix pour 5 adultes (CHF)
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
