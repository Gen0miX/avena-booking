"use client";

import { PERIOD_PRICE_FIELDS, PricingPeriod } from "@/lib/pricingPeriods";
import {
  ApartmentSlug,
  getApartmentBySlug,
  getRateTableColumns,
} from "@/config/apartments";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";

interface PricingPeriodsListProps {
  periods: PricingPeriod[];
  onEdit: (period: PricingPeriod) => void;
  onDelete: (id: number) => void;
  apartmentSlug: ApartmentSlug;
}

const toDate = (dateStr: string) => new Date(dateStr + "T00:00:00");

export default function PricingPeriodsList({
  periods,
  onEdit,
  onDelete,
  apartmentSlug,
}: PricingPeriodsListProps) {
  const apartment = getApartmentBySlug(apartmentSlug);
  const columns = apartment ? getRateTableColumns(apartment) : [];
  const fallbackLabels = ["Jusqu'à 2 pers.", "Jusqu'à 4 pers.", "Jusqu'à 6 pers."];
  if (periods.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/65">
        Aucune période spéciale définie.
      </p>
    );
  }

  // Grouper les périodes par année
  const periodsByYear = periods.reduce(
    (acc, period) => {
      const year = period.start_date.substring(0, 4);
      if (!acc[year]) acc[year] = [];
      acc[year].push(period);
      return acc;
    },
    {} as Record<string, PricingPeriod[]>,
  );

  const formatRange = (period: PricingPeriod) => {
    const start = toDate(period.start_date);
    const end = toDate(period.end_date);
    const nights = differenceInCalendarDays(end, start);
    return `${format(start, "d MMM", { locale: fr })} – ${format(end, "d MMM yyyy", {
      locale: fr,
    })} · ${nights} nuit${nights > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(periodsByYear)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, yearPeriods]) => (
          <div key={year} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold tracking-[0.08em] uppercase text-base-content/65">
              {year}
            </h3>
            <ul className="border border-base-200 rounded-xl divide-y divide-base-200">
              {yearPeriods.map((period) => (
                <li
                  key={period.id}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3.5"
                >
                  <div className="flex-1 basis-48 min-w-0">
                    <p className="font-semibold">{period.name}</p>
                    <p className="text-[13px] text-base-content/65">{formatRange(period)}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm tabular-nums">
                    {PERIOD_PRICE_FIELDS.map((field, i) => (
                      <span key={field}>
                        <span className="text-base-content/65">
                          {columns[i]?.label ?? fallbackLabels[i]}
                        </span>{" "}
                        CHF {period[field]}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="btn btn-square h-10 w-10 rounded-xl btn-outline border-base-300"
                      onClick={() => onEdit(period)}
                      aria-label={`Modifier ${period.name}`}
                    >
                      <IoCreateOutline size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-square h-10 w-10 rounded-xl btn-outline btn-error"
                      onClick={() => onDelete(period.id)}
                      aria-label={`Supprimer ${period.name}`}
                    >
                      <IoTrashOutline size={17} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
