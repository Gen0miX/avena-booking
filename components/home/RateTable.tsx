import { SeasonKey } from "@/lib/pricingPeriods";
import {
  ApartmentConfig,
  getRateTableColumns,
  getTierPrice,
} from "@/config/apartments";

// Mirrors the calendar in getSeasonKeyForDate (lib/pricingPeriods.ts).
const SEASONS: { key: SeasonKey; name: string; dates: string }[] = [
  { key: "basseSaison", name: "Basse saison", dates: "Mai – octobre" },
  { key: "novembre", name: "Novembre", dates: "Novembre" },
  { key: "hiver", name: "Hiver", dates: "1–17 déc. et 11 janv. – avril" },
  { key: "fetes", name: "Fêtes", dates: "18 déc. – 10 janv." },
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
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.06em] text-base-content/70">
            <th scope="col" className="px-5 py-4 font-semibold">
              Saison
            </th>
            {columns.map((col) => (
              <th key={col.minAdults} scope="col" className="px-5 py-4 font-semibold">
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
                <td key={col.minAdults} className="px-5 py-4 tabular-nums">
                  CHF {getTierPrice(apartment.defaultRates[season.key], col.minAdults)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
