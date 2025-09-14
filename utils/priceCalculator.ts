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
  const isMonthHigh = (date?: Date) => {
    if (!date) return false;
    const month = date.getMonth();
    return month >= 10 || month <= 3; // novembre (10) à avril (3)
  };

  return isMonthHigh(start) || isMonthHigh(end);
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
  const season: "high" | "low" = isHighSeason(start, end) ? "high" : "low";
  const nights = getNights(start, end);

  const rate = getRate(season, adults);
  if (!rate) return 0;

  // 1ère nuit incluse dans le prix de base
  return rate.base + (nights - 1) * rate.perNight;
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
