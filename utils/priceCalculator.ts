type PriceParams = {
  start?: Date;
  end?: Date;
  adults: number;
};

type Rate = {
  base: number;
  perNight: number;
};

const rates = {
  high: {
    family: { base: 250, perNight: 250 }, // famille (<=2 adultes) ou 2 adultes
    threeFour: { base: 280, perNight: 280 }, // 3-4 adultes
    five: { base: 300, perNight: 300 }, // 5 adultes
  },
  low: {
    family: { base: 200, perNight: 200 }, // famille ou 4 adultes
    five: { base: 250, perNight: 250 }, // 5 adultes
  },
  special: {
    family: { base: 230, perNight: 230 }, // période spéciale : 230€/nuit pour <=4 adultes
    five: { base: 250, perNight: 250 }, // période spéciale : 250€/nuit pour 5 adultes
  },
};

export type Category =
  | "Famille"
  | "Plein (3-4 adultes)"
  | "Plein (5 adultes)"
  | "Plein"; // pour la basse saison

export function getCategory(
  adults: number,
  start?: Date,
  end?: Date
): Category {
  // Si toutes les nuits sont dans la période spéciale, afficher seulement "Plein".
  if (start && end && areAllNightsSpecial(start, end)) {
    return "Plein";
  }

  // Si au moins une nuit est en haute saison (hors périodes spéciales),
  // on garde le comportement détaillé pour la haute saison.
  const season: "high" | "low" = isHighSeason(start, end) ? "high" : "low";

  if (season === "high") {
    if (adults <= 2) return "Famille";
    if (adults <= 4) return "Plein (3-4 adultes)";
    return "Plein (5 adultes)";
  } else {
    if (adults <= 4) return "Famille";
    return "Plein"; // 5 adultes
  }
}

export function isHighSeason(start?: Date, end?: Date): boolean {
  // Détecte si AU MOINS une nuit du séjour est en haute saison
  // en excluant les nuits qui sont dans les périodes spéciales.
  if (!start || !end) return false;

  return hasAnyHighNight(start, end);
}

function hasAnyHighNight(start: Date, end: Date): boolean {
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  while (cur.getTime() < endDay.getTime()) {
    // si ce jour n'est pas dans les périodes spéciales et est dans un mois "high"
    if (!isDateInSpecialRanges(cur)) {
      const month = cur.getMonth();
      if (month >= 10 || month <= 3) return true;
    }
    cur = new Date(cur.getTime() + msPerNight);
  }

  return false;
}

function areAllNightsSpecial(start: Date, end: Date): boolean {
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  while (cur.getTime() < endDay.getTime()) {
    if (!isDateInSpecialRanges(cur)) return false;
    cur = new Date(cur.getTime() + msPerNight);
  }

  return true;
}

// Vérifie si une date (jour/nuit) est dans l'une des périodes spéciales demandées :
// 01.11 -> 19.12  et  04.01 -> 23.01 (inclus)
function isDateInSpecialRanges(date: Date): boolean {
  const d = stripTime(date);
  const month = d.getMonth();
  const day = d.getDate();

  // Nov 01 (10/1) -> Dec 19 (11/19)
  if (month === 10 && day >= 1) return true; // Nov remainder
  if (month === 11 && day <= 19) return true; // Dec up to 19

  // Jan 04 -> Jan 23
  if (month === 0 && day >= 4 && day <= 23) return true;

  return false;
}

function getPerNightRateForDate(date: Date, adults: number): number {
  // priorité aux périodes spéciales
  if (isDateInSpecialRanges(date)) {
    return adults === 5
      ? rates.special.five.perNight
      : rates.special.family.perNight;
  }

  // sinon déterminer saison par le mois de la nuit
  const month = date.getMonth();
  const season: "high" | "low" = month >= 10 || month <= 3 ? "high" : "low";

  if (season === "high") {
    if (adults <= 2) return rates.high.family.perNight;
    if (adults <= 4) return rates.high.threeFour.perNight;
    return rates.high.five.perNight;
  } else {
    if (adults <= 4) return rates.low.family.perNight;
    return rates.low.five.perNight;
  }
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getNights(start: Date, end: Date): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  const startDay = stripTime(start);
  const endDay = stripTime(end);

  return Math.max(1, (endDay.getTime() - startDay.getTime()) / msPerNight);
}

function getRate(season: "high" | "low", adults: number): Rate | null {
  if (season === "high") {
    if (adults <= 2) return rates.high.family;
    if (adults <= 4) return rates.high.threeFour;
    if (adults === 5) return rates.high.five;
  } else {
    if (adults <= 4) return rates.low.family;
    if (adults === 5) return rates.low.five;
  }
  return null;
}

function calculatePrice(start: Date, end: Date, adults: number): number {
  // Calculer prix nuit-par-nuit pour pouvoir mixer périodes spéciales et autres saisons.
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  let total = 0;
  while (cur.getTime() < endDay.getTime()) {
    total += getPerNightRateForDate(cur, adults);
    cur = new Date(cur.getTime() + msPerNight);
  }

  return total;
}

export function getPriceResult({ start, end, adults }: PriceParams): {
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

  const price = calculatePrice(start, end, adults);
  return { price, error: null };
}
