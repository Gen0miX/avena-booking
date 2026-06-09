// Période personnalisée stockée en base de données (Carnaval, etc.)
export interface PricingPeriod {
  id: number;
  name: string;
  start_date: string; // ISO date string "YYYY-MM-DD"
  end_date: string; // ISO date string "YYYY-MM-DD"
  price_standard: number; // Prix pour <=4 adultes (CHF)
  price_five: number; // Prix pour 5 adultes (CHF)
  created_at?: string;
  updated_at?: string;
}

export interface PricingPeriodInput {
  name: string;
  start_date: string;
  end_date: string;
  price_standard: number;
  price_five: number;
}

// Tarifs par défaut récurrents (s'appliquent chaque année)
export interface DefaultRate {
  name: string;
  price_couple?: number; // Prix pour 1-2 adultes (optionnel)
  price_standard: number;
  price_five: number;
}

// Tarifs par défaut pour chaque saison
export const DEFAULT_RATES: Record<string, DefaultRate> = {
  basseSaison: {
    name: "Basse saison",
    price_couple: 150,
    price_standard: 200,
    price_five: 250,
  },
  novembre: {
    name: "Novembre",
    price_standard: 250,
    price_five: 250,
  },
  hiver: {
    name: "Hiver",
    price_standard: 280,
    price_five: 300,
  },
  fetes: {
    name: "Fêtes",
    price_standard: 350,
    price_five: 400,
  },
};

/**
 * Détermine le tarif par défaut applicable pour une date donnée
 * basé sur le mois et le jour (récurrent chaque année)
 */
export function getDefaultRateForDate(date: Date): DefaultRate {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Fêtes : 18 décembre - 10 janvier
  if (month === 11 && day >= 18) {
    return DEFAULT_RATES.fetes;
  }
  if (month === 0 && day <= 10) {
    return DEFAULT_RATES.fetes;
  }

  // Hiver : 11 janvier - 30 avril
  if (month === 0 && day >= 11) {
    return DEFAULT_RATES.hiver;
  }
  if (month >= 1 && month <= 3) {
    return DEFAULT_RATES.hiver;
  }

  // Basse saison : mai - octobre
  if (month >= 4 && month <= 9) {
    return DEFAULT_RATES.basseSaison;
  }

  // Novembre
  if (month === 10) {
    return DEFAULT_RATES.novembre;
  }

  // Décembre 1-17 : tarif hiver
  if (month === 11 && day < 18) {
    return DEFAULT_RATES.hiver;
  }

  // Fallback (ne devrait jamais arriver)
  return DEFAULT_RATES.basseSaison;
}
