type PriceParams = {
  start?: Date;
  end?: Date;
  adults: number;
};

export function isHighSeason(start?: Date, end?: Date): boolean {
  const isMonthHigh = (date?: Date) => {
    if (!date) return false;
    const month = date.getMonth();
    return month >= 10 || month <= 3; // novembre (10) à avril (3)
  };

  return isMonthHigh(start) || isMonthHigh(end);
}

export function isFamilyRate(adults: number): boolean {
  return adults <= 2;
}

export function getNights(start: Date, end: Date): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / msPerNight)
  );
}

const prices = {
  high: {
    family: [0, 0, 400, 600, 800, 900, 1000, 1100],
    full: [0, 0, 500, 800, 1100, 1400, 1500, 1600],
  },
  low: {
    family: [0, 0, 300, 500, 600, 700, 800, 900],
    full: [0, 0, 400, 600, 800, 1000, 1100, 1200],
  },
};

function calculatePrice(start: Date, end: Date, adults: number): number {
  const highSeason = isHighSeason(start, end);
  const family = isFamilyRate(adults);
  const nights = getNights(start, end);

  const season = highSeason ? "high" : "low";
  const category = family ? "family" : "full";

  const base = prices[season][category][Math.min(nights, 7)];
  const extra = nights > 7 ? (nights - 7) * 100 : 0;

  return base + extra;
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
