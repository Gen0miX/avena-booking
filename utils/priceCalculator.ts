import { PricingPeriod, getDefaultRateForDate } from "@/lib/pricingPeriods";

type PriceParams = {
  start?: Date;
  end?: Date;
  adults: number;
  customPeriods?: PricingPeriod[]; // Périodes personnalisées (Carnaval, etc.)
};

export type Category = "1-2 adultes" | "Famille" | "Plein (5 adultes)";

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Formate une date en string YYYY-MM-DD (sans problème de timezone)
 */
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

/**
 * Trouve une période personnalisée (DB) applicable pour une date donnée
 */
function findCustomPeriodForDate(
  date: Date,
  customPeriods: PricingPeriod[],
): PricingPeriod | null {
  const dateStr = formatDateToString(date);

  for (const period of customPeriods) {
    if (dateStr >= period.start_date && dateStr < period.end_date) {
      return period;
    }
  }

  return null;
}

/**
 * Retourne le prix par nuit pour une date et un nombre d'adultes
 * Priorité : 1. Période personnalisée (DB) 2. Tarif par défaut (récurrent)
 */
function getPriceForDate(
  date: Date,
  adults: number,
  customPeriods: PricingPeriod[],
): number {
  // 1. Vérifier si une période personnalisée s'applique (ex: Carnaval)
  const customPeriod = findCustomPeriodForDate(date, customPeriods);
  if (customPeriod) {
    return adults === 5 ? customPeriod.price_five : customPeriod.price_standard;
  }

  // 2. Sinon, utiliser le tarif par défaut selon la saison
  const defaultRate = getDefaultRateForDate(date);
  if (adults === 5) return defaultRate.price_five;
  if (adults <= 2 && defaultRate.price_couple !== undefined) return defaultRate.price_couple;
  return defaultRate.price_standard;
}

/**
 * Calcule le prix total pour une plage de dates
 */
function calculatePrice(
  start: Date,
  end: Date,
  adults: number,
  customPeriods: PricingPeriod[],
): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  let total = 0;
  while (cur.getTime() < endDay.getTime()) {
    total += getPriceForDate(cur, adults, customPeriods);
    cur = new Date(cur.getTime() + msPerNight);
  }

  return total;
}

/**
 * Détermine la catégorie pour l'affichage
 */
export function getCategory(adults: number): Category {
  if (adults <= 2) return "1-2 adultes";
  if (adults <= 4) return "Famille";
  return "Plein (5 adultes)";
}

/**
 * Fonction principale de calcul de prix
 * customPeriods : périodes personnalisées depuis la DB (ex: Carnaval)
 * Les tarifs par défaut (Basse saison, Novembre, Hiver, Fêtes) sont automatiques
 */
export function getPriceResult({
  start,
  end,
  adults,
  customPeriods = [],
}: PriceParams): {
  price: number | null;
  error: string | null;
} {
  if (!start || !end) {
    return { price: null, error: null };
  }

  if (adults < 1) {
    return { price: null, error: "Il faut au moins un adulte." };
  }

  const nights = getNights(start, end);
  if (nights < 2) {
    return { price: null, error: "Le minimum de séjour est de 2 nuits." };
  }

  if (adults > 5) {
    return { price: null, error: "Le nombre maximum d'adultes est 5." };
  }

  const price = calculatePrice(start, end, adults, customPeriods);

  return { price, error: null };
}
