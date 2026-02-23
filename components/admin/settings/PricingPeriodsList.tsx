"use client";

import { PricingPeriod } from "@/lib/pricingPeriods";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaEdit, FaTrash } from "react-icons/fa";

interface PricingPeriodsListProps {
  periods: PricingPeriod[];
  onEdit: (period: PricingPeriod) => void;
  onDelete: (id: number) => void;
}

export default function PricingPeriodsList({
  periods,
  onEdit,
  onDelete,
}: PricingPeriodsListProps) {
  if (periods.length === 0) {
    return (
      <div className="card bg-base-200 border border-primary/20">
        <div className="card-body text-center">
          <p className="text-base-content/70">
            Aucune période tarifaire définie.
          </p>
        </div>
      </div>
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
    {} as Record<string, PricingPeriod[]>
  );

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr + "T00:00:00"), "dd MMM yyyy", {
      locale: fr,
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(periodsByYear)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, yearPeriods]) => (
          <div key={year} className="space-y-2">
            <h4 className="text-lg font-semibold text-primary">{year}</h4>
            <div className="overflow-x-auto">
              <table className="table table-zebra bg-base-200 border border-primary/20">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th className="text-right">Standard</th>
                    <th className="text-right">5 adultes</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {yearPeriods.map((period) => (
                    <tr key={period.id}>
                      <td className="font-medium">{period.name}</td>
                      <td>{formatDate(period.start_date)}</td>
                      <td>{formatDate(period.end_date)}</td>
                      <td className="text-right">
                        {period.price_standard} CHF
                      </td>
                      <td className="text-right">{period.price_five} CHF</td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => onEdit(period)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => onDelete(period.id)}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}
