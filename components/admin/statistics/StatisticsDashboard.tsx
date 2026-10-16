import { useState, useMemo } from "react";
import { useBookings } from "@/hooks/usebookings";
import { ApartmentSlug, APARTMENT_LIST } from "@/config/apartments";
import {
  Period,
  getChartData,
  calculateOccupancyRate,
  calculateAggregateOccupancyRate,
  calculateTotalRevenue,
  calculateAverageStayDuration,
  filterBookingsByStartDate,
} from "@/lib/statistics";
import StatsCard from "./StatsCard";
import OccupancyChart from "./charts/OccupancyChart";
import RevenueChart from "./charts/RevenueChart";
import ReservationsChart from "./charts/ReservationsChart";
import AverageStayChart from "./charts/AverageStayChart";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { addMonths, addYears, addQuarters, subMonths, subYears, subQuarters, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function StatisticsDashboard({ apartment }: { apartment: ApartmentSlug | "all" }) {
  const { bookings, isLoading, isError } = useBookings(apartment);
  const [period, setPeriod] = useState<Period>("year");
  const [date, setDate] = useState(new Date());

  const handlePrevious = () => {
    if (period === "month") setDate(subMonths(date, 1));
    else if (period === "quarter") setDate(subQuarters(date, 1));
    else if (period === "year") setDate(subYears(date, 1));
  };

  const handleNext = () => {
    if (period === "month") setDate(addMonths(date, 1));
    else if (period === "quarter") setDate(addQuarters(date, 1));
    else if (period === "year") setDate(addYears(date, 1));
  };

  const periodLabel = useMemo(() => {
    if (period === "month") return format(date, "MMMM yyyy", { locale: fr });
    if (period === "year") return format(date, "yyyy", { locale: fr });
    if (period === "quarter") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `T${quarter} ${format(date, "yyyy", { locale: fr })}`;
    }
    return "";
  }, [period, date]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return filterBookingsByStartDate(bookings, period, date);
  }, [bookings, period, date]);

  const stats = useMemo(() => {
    if (!bookings) return { occupancy: 0, revenue: 0, reservations: 0, avgStay: 0 };
    return {
      occupancy:
        apartment === "all"
          ? calculateAggregateOccupancyRate(bookings, APARTMENT_LIST.map((a) => a.slug), period, date)
          : calculateOccupancyRate(bookings, period, date),
      revenue: calculateTotalRevenue(filteredBookings),
      reservations: filteredBookings.length,
      avgStay: calculateAverageStayDuration(filteredBookings),
    };
  }, [bookings, filteredBookings, period, date, apartment]);

  const chartsData = useMemo(() => {
    if (!bookings) return null;
    return {
      revenue: getChartData(bookings, period, "revenue", date),
      reservations: getChartData(bookings, period, "reservations", date),
      occupancy: getChartData(
        bookings,
        period,
        "occupancy",
        date,
        apartment === "all" ? APARTMENT_LIST.map((a) => a.slug) : undefined
      ),
      avgStay: getChartData(bookings, period, "avgStay", date),
    };
  }, [bookings, period, date, apartment]);

  if (isLoading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg text-cta"></span></div>;
  if (isError) return <div role="alert" className="alert alert-error">Erreur lors du chargement des données</div>;

  const periodOptions: { value: Period; label: string }[] = [
    { value: "month", label: "Mois" },
    { value: "quarter", label: "Trimestre" },
    { value: "year", label: "Année" },
  ];
  const chartCard = (title: string, unit: string, chart: React.ReactNode) => (
    <section className="bg-surface rounded-2xl p-5 sm:p-6">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        <span className="text-[13px] text-base-content/65">{unit}</span>
      </div>
      {chart}
    </section>
  );

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Période */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {apartment === "all" ? (
          <span className="badge badge-soft rounded-full">Vue globale — tous les appartements</span>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label="Période" className="flex bg-base-300/60 rounded-xl p-1 gap-1">
            {periodOptions.map((option) => {
              const checked = period === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setPeriod(option.value)}
                  className={`px-3.5 py-2 rounded-[9px] text-sm ${
                    checked ? "bg-surface font-semibold shadow-sm" : "text-base-content/75 hover:text-base-content"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center bg-surface rounded-xl border border-base-300">
            <button type="button" aria-label="Période précédente" className="btn btn-ghost btn-square h-11" onClick={handlePrevious}>
              <FaChevronLeft aria-hidden="true" />
            </button>
            <span className="min-w-[120px] text-center font-semibold capitalize" aria-live="polite">
              {periodLabel}
            </span>
            <button type="button" aria-label="Période suivante" className="btn btn-ghost btn-square h-11" onClick={handleNext}>
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Taux d'occupation"
          value={`${stats.occupancy.toFixed(0)} %`}
          progress={stats.occupancy}
        />
        <StatsCard
          title="Revenus"
          value={`CHF ${Math.round(stats.revenue).toLocaleString("fr-CH")}`}
          description="hors réservations annulées"
        />
        <StatsCard
          title="Réservations"
          value={stats.reservations}
          description="séjours commençant sur la période"
        />
        <StatsCard
          title="Durée moyenne"
          value={`${stats.avgStay.toFixed(1).replace(".", ",")} nuits`}
          description="par séjour"
        />
      </div>

      {/* Graphiques */}
      {period !== "month" && chartsData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {chartCard("Occupation", "en % des nuits", <OccupancyChart data={chartsData.occupancy} />)}
          {chartCard("Revenus", "CHF", <RevenueChart data={chartsData.revenue} />)}
          {chartCard("Réservations", "nombre de séjours", <ReservationsChart data={chartsData.reservations} />)}
          {chartCard("Durée moyenne des séjours", "nuits", <AverageStayChart data={chartsData.avgStay} />)}
        </div>
      )}
    </div>
  );
}
