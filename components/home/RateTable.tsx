import { SeasonKey } from "@/lib/pricingPeriods";
import {
  ApartmentConfig,
  getRateTableColumns,
  getTierPrice,
} from "@/config/apartments";

// Mirrors the calendar in getSeasonKeyForDate (lib/pricingPeriods.ts).
const SEASONS: { key: SeasonKey; name: string; dates: string }[] = [
  { key: "hiver", name: "Hiver", dates: "Décembre – avril" },
  { key: "ete", name: "Été", dates: "Mai – novembre" },
];

export default function RateTable({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const columns = getRateTableColumns(apartment);

  return (
    <div className="overflow-x-auto bg-surface rounded-2xl">
      <table className="w-full min-w-[520px] text-[15px]">
        <caption className="sr-only">
          Prix par nuit selon la saison et le nombre de personnes, enfants compris
        </caption>
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.06em] text-base-content/70">
            <th scope="col" className="px-5 py-4 font-semibold">
              Saison
            </th>
            {columns.map((col) => (
              <th key={col.minGuests} scope="col" className="px-5 py-4 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SEASONS.map((season) => (
            <tr key={season.key} className="border-t border-base-200">
              <th scope="row" className="px-5 py-4 text-left font-normal">
                <span className="block font-semibold">{season.name}</span>
                <span className="block text-[13px] text-base-content/65">
                  {season.dates}
                </span>
              </th>
              {columns.map((col) => (
                <td key={col.minGuests} className="px-5 py-4 tabular-nums">
                  CHF {getTierPrice(apartment.defaultRates[season.key], col.minGuests)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
