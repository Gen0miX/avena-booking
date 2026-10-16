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
