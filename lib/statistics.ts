import { Booking } from "./bookings";
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, eachDayOfInterval, isWithinInterval, differenceInDays, format, subMonths, subQuarters, subYears } from "date-fns";
import { fr } from "date-fns/locale";

export type Period = "month" | "quarter" | "year";

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface StatsSummary {
  occupancyRate: number;
  totalRevenue: number;
  totalReservations: number;
  averageStayDuration: number;
}

export const getPeriodDates = (period: Period, date: Date = new Date()) => {
  switch (period) {
    case "month":
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case "quarter":
      return { start: startOfQuarter(date), end: endOfQuarter(date) };
    case "year":
      return { start: startOfYear(date), end: endOfYear(date) };
  }
};

export const filterBookingsByPeriod = (bookings: Booking[], period: Period, date: Date = new Date()) => {
  const { start, end } = getPeriodDates(period, date);
  return bookings.filter((booking) => {
    const bookingStart = new Date(booking.arrival_date);
    const bookingEnd = new Date(booking.departure_date);
    // Check if booking overlaps with the period
    return (
      booking.status.id !== 4 &&
      (isWithinInterval(bookingStart, { start, end }) ||
      isWithinInterval(bookingEnd, { start, end }) ||
      (bookingStart < start && bookingEnd > end))
    );
  });
};

export const calculateOccupancyRate = (bookings: Booking[], period: Period, date: Date = new Date()) => {
  const { start, end } = getPeriodDates(period, date);
  const totalDays = differenceInDays(end, start) + 1;
  
  let occupiedDays = 0;
  const daysInPeriod = eachDayOfInterval({ start, end });

  daysInPeriod.forEach((day) => {
    const isOccupied = bookings.some((booking) => {
      if (booking.status.id === 4) return false;
      const bookingStart = new Date(booking.arrival_date);
      const bookingEnd = new Date(booking.departure_date);
      return isWithinInterval(day, { start: bookingStart, end: bookingEnd });
    });
    if (isOccupied) occupiedDays++;
  });

  return totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;
};

export const calculateTotalRevenue = (bookings: Booking[]) => {
  return bookings.reduce((total, booking) => total + booking.price, 0);
};

export const calculateAverageStayDuration = (bookings: Booking[]) => {
  if (bookings.length === 0) return 0;
  const totalDuration = bookings.reduce((total, booking) => {
    const start = new Date(booking.arrival_date);
    const end = new Date(booking.departure_date);
    return total + differenceInDays(end, start);
  }, 0);
  return totalDuration / bookings.length;
};

export const getChartData = (bookings: Booking[], period: Period, metric: "revenue" | "reservations" | "occupancy" | "avgStay", date: Date = new Date()): ChartData => {
  const { start, end } = getPeriodDates(period, date);
  // Logic to group data by day/month depending on the period
  // For simplicity in this first pass, let's group by Month for Year view, and by Day for Month view.
  
  let labels: string[] = [];
  let data: number[] = [];

  if (period === "year") {
    // Group by month
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(date.getFullYear(), i, 1);
        labels.push(format(monthDate, "MMMM", { locale: fr }));
        
        const monthBookings = filterBookingsByPeriod(bookings, "month", monthDate);
        
        if (metric === "revenue") {
            data.push(calculateTotalRevenue(monthBookings));
        } else if (metric === "reservations") {
            data.push(monthBookings.length);
        } else if (metric === "occupancy") {
            data.push(calculateOccupancyRate(monthBookings, "month", monthDate));
        } else if (metric === "avgStay") {
            data.push(calculateAverageStayDuration(monthBookings));
        }
    }
  } else {
      // Group by day (for month and quarter - though quarter might be better by week/month, let's stick to simple first)
      // Actually for quarter, maybe by month is better? Let's do by month for quarter too for now if it fits, or by week?
      // Let's stick to a simple breakdown: 
      // Month -> Days
      // Quarter -> Months
      // Year -> Months
      
      if (period === "quarter") {
           const startMonth = start.getMonth();
           for (let i = 0; i < 3; i++) {
               const monthDate = new Date(date.getFullYear(), startMonth + i, 1);
               labels.push(format(monthDate, "MMMM", { locale: fr }));
               const monthBookings = filterBookingsByPeriod(bookings, "month", monthDate);
               if (metric === "revenue") data.push(calculateTotalRevenue(monthBookings));
               else if (metric === "reservations") data.push(monthBookings.length);
               else if (metric === "occupancy") data.push(calculateOccupancyRate(monthBookings, "month", monthDate));
               else if (metric === "avgStay") data.push(calculateAverageStayDuration(monthBookings));
           }
      } else {
          // Month -> Days
          const days = eachDayOfInterval({ start, end });
          labels = days.map(d => format(d, "d"));
          data = days.map(day => {
              // This is a bit expensive, optimizing later if needed
              // For revenue/reservations, we count based on arrival date? or spread?
              // Usually revenue is recognized on arrival or departure or spread. Let's say on arrival for simplicity or count if active?
              // For "Revenue generated", usually it's sum of bookings in that period. 
              // If we break down by day, it's weird for revenue. 
              // Maybe for Month view, we just show "Reservations starting this day"?
              
              if (metric === "occupancy") {
                  // 1 if occupied, 0 if not
                  const isOccupied = bookings.some(b => b.status.id !== 4 && isWithinInterval(day, { start: new Date(b.arrival_date), end: new Date(b.departure_date) }));
                  return isOccupied ? 100 : 0;
              } else {
                  // For revenue/reservations, count those starting on this day
                  const startingToday = bookings.filter(b => {
                      if (b.status.id === 4) return false;
                      const start = new Date(b.arrival_date);
                      return start.getDate() === day.getDate() && start.getMonth() === day.getMonth() && start.getFullYear() === day.getFullYear();
                  });
                  if (metric === "revenue") return calculateTotalRevenue(startingToday);
                  if (metric === "reservations") return startingToday.length;
                  if (metric === "avgStay") return calculateAverageStayDuration(startingToday);
                  return 0;
              }
          });
      }
  }

  return {
    labels,
    datasets: [
      {
        label: metric === "revenue" ? "Revenus (CHF)" : metric === "reservations" ? "Réservations" : metric === "occupancy" ? "Taux d'occupation (%)" : "Durée moyenne (nuits)",
        data,
        backgroundColor: metric === "revenue" ? "rgba(75, 192, 192, 0.5)" : metric === "reservations" ? "rgba(54, 162, 235, 0.5)" : metric === "occupancy" ? "rgba(255, 206, 86, 0.5)" : "rgba(153, 102, 255, 0.5)",
        borderColor: metric === "revenue" ? "rgb(75, 192, 192)" : metric === "reservations" ? "rgb(54, 162, 235)" : metric === "occupancy" ? "rgb(255, 206, 86)" : "rgb(153, 102, 255)",
        borderWidth: 1,
      },
    ],
  };
};
