import { useState, useMemo } from "react";
import { useBookings } from "@/hooks/usebookings";
import {
  Period,
  getChartData,
  calculateOccupancyRate,
  calculateTotalRevenue,
  calculateAverageStayDuration,
  filterBookingsByPeriod,
} from "@/lib/statistics";
import StatsCard from "./StatsCard";
import OccupancyChart from "./charts/OccupancyChart";
import RevenueChart from "./charts/RevenueChart";
import ReservationsChart from "./charts/ReservationsChart";
import AverageStayChart from "./charts/AverageStayChart";
import { FaCoins, FaCalendarCheck, FaBed, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { addMonths, addYears, addQuarters, subMonths, subYears, subQuarters, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function StatisticsDashboard() {
  const { bookings, isLoading, isError } = useBookings();
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
    return filterBookingsByPeriod(bookings, period, date);
  }, [bookings, period, date]);

  const stats = useMemo(() => {
    if (!bookings) return { occupancy: 0, revenue: 0, reservations: 0, avgStay: 0 };
    return {
      occupancy: calculateOccupancyRate(bookings, period, date),
      revenue: calculateTotalRevenue(filteredBookings),
      reservations: filteredBookings.length,
      avgStay: calculateAverageStayDuration(filteredBookings),
    };
  }, [bookings, filteredBookings, period, date]);

  const chartsData = useMemo(() => {
    if (!bookings) return null;
    return {
      revenue: getChartData(bookings, period, "revenue", date),
      reservations: getChartData(bookings, period, "reservations", date),
      occupancy: getChartData(bookings, period, "occupancy", date),
      avgStay: getChartData(bookings, period, "avgStay", date),
    };
  }, [bookings, period, date]);

  if (isLoading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  if (isError) return <div className="alert alert-error">Erreur lors du chargement des données</div>;

  return (
    <div className="py-4 sm:p-4 space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-base-100 p-4 rounded-box shadow-sm gap-4 border border-primary/20">
        <h2 className="text-xl font-bold">Statistiques</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="join">
            <button
                className={`join-item btn btn-xs sm:btn-sm ${period === "month" ? "btn-active btn-primary" : ""}`}
                onClick={() => setPeriod("month")}
            >
                Mois
            </button>
            <button
                className={`join-item btn btn-xs sm:btn-sm ${period === "quarter" ? "btn-active btn-primary" : ""}`}
                onClick={() => setPeriod("quarter")}
            >
                Trimestre
            </button>
            <button
                className={`join-item btn btn-xs sm:btn-sm ${period === "year" ? "btn-active btn-primary" : ""}`}
                onClick={() => setPeriod("year")}
            >
                Année
            </button>
            </div>

            <div className="flex items-center gap-2 bg-base-200 rounded-lg p-1">
                <button className="btn btn-sm btn-ghost btn-square" onClick={handlePrevious}>
                    <FaChevronLeft />
                </button>
                <span className="min-w-[120px] text-center font-medium capitalize">{periodLabel}</span>
                <button className="btn btn-sm btn-ghost btn-square" onClick={handleNext}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Taux d'occupation"
          value={`${stats.occupancy.toFixed(1)}%`}
          icon={<FaBed className="text-2xl" />}
        />
        <StatsCard
          title="Revenus"
          value={`${stats.revenue.toLocaleString("fr-FR", { style: "currency", currency: "CHF" })}`}
          icon={<FaCoins  className="text-2xl" />}
        />
        <StatsCard
          title="Réservations"
          value={stats.reservations}
          icon={<FaCalendarCheck className="text-2xl" />}
        />
        <StatsCard
          title="Durée moyenne"
          value={`${stats.avgStay.toFixed(1)} nuits`}
          icon={<FaClock className="text-2xl" />}
        />
      </div>

      {/* Charts */}
      {period !== "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartsData?.occupancy && (
            <div className="card bg-base-100 shadow-sm border border-primary/20">
              <div className="card-body p-4">
                <h3 className="card-title text-base-content">Taux d'occupation</h3>
                <OccupancyChart data={chartsData.occupancy} />
              </div>
            </div>
          )}
          {chartsData?.revenue && (
            <div className="card bg-base-100 shadow-sm border border-primary/20">
              <div className="card-body p-4">
                <h3 className="card-title text-base-content">Revenus générés</h3>
                <RevenueChart data={chartsData.revenue} />
              </div>
            </div>
          )}
          {chartsData?.reservations && (
            <div className="card bg-base-100 shadow-sm border border-primary/20">
              <div className="card-body p-4">
                <h3 className="card-title text-base-content">Nombre de réservations</h3>
                <ReservationsChart data={chartsData.reservations} />
              </div>
            </div>
          )}
          {chartsData?.avgStay && (
            <div className="card bg-base-100 shadow-sm border border-primary/20">
              <div className="card-body p-4">
                <h3 className="card-title text-base-content">Durée moyenne des séjours</h3>
                <AverageStayChart data={chartsData.avgStay} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
