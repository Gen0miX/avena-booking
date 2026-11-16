import { PricingPeriod } from "@/lib/pricingPeriods";
import { getPeriodPrice, getSeasonKeyForDate } from "@/lib/pricingPeriods";
import { ApartmentConfig, getRateTableColumns, getTierPrice } from "@/config/apartments";

type PriceParams = {
  start?: Date;
  end?: Date;
  adults: number;
  /** Les enfants comptent dans le nombre de personnes qui fixe le palier. */
  children?: number;
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
  guests: number,
  customPeriods: PricingPeriod[],
  apartment: ApartmentConfig,
): number {
  const customPeriod = findCustomPeriodForDate(date, customPeriods);
  if (customPeriod) {
    return getPeriodPrice(customPeriod, guests);
  }

  const seasonKey = getSeasonKeyForDate(date);
  const seasonTiers = apartment.defaultRates[seasonKey];
  return getTierPrice(seasonTiers, guests);
}

function calculatePrice(
  start: Date,
  end: Date,
  guests: number,
  customPeriods: PricingPeriod[],
  apartment: ApartmentConfig,
): number {
  const msPerNight = 1000 * 60 * 60 * 24;
  let cur = stripTime(start);
  const endDay = stripTime(end);

  let total = 0;
  while (cur.getTime() < endDay.getTime()) {
    total += getPriceForDate(cur, guests, customPeriods, apartment);
    cur = new Date(cur.getTime() + msPerNight);
  }

  return total;
}

/** Libellé du palier appliqué, ex. « Jusqu'à 4 pers. ». */
export function getCategory(guests: number, apartment: ApartmentConfig): Category {
  const columns = getRateTableColumns(apartment);
  const column =
    columns.find((c) => guests >= c.minGuests && guests <= c.maxGuests) ??
    columns[columns.length - 1];
  return column.label;
}

export function getPriceResult({
  start,
  end,
  adults,
  children = 0,
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

  const guests = adults + Math.max(0, children);
  if (guests > apartment.capacity) {
    return {
      price: null,
      error: `Cet appartement accueille ${apartment.capacity} personnes au maximum (enfants compris).`,
    };
  }

  const price = calculatePrice(start, end, guests, customPeriods, apartment);

  return { price, error: null };
}
