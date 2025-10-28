import { useState, useMemo } from "react";
import useSWR from "swr";
import { Booking } from "@/lib/bookings";
import { compareAsc } from "date-fns";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur de chargement");
  }

  return res.json();
};

export type FilterStatus = "all" | number; // number = status id

export type SortField = "dates" | "name" | "price" | "status";
export type SortOrder = "asc" | "desc";

export interface BookingFilters {
  status: FilterStatus;
  sortBy: SortField;
  sortOrder: SortOrder;
}

const defaultFilters: BookingFilters = {
  status: "all",
  sortBy: "dates",
  sortOrder: "desc",
};

export function useBookings(initialFilters?: Partial<BookingFilters>) {
  const { data, error, isLoading, mutate } = useSWR("/api/bookings", fetcher);

  const [filters, setFilters] = useState<BookingFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  // Fonction pour appliquer les filtres
  const filterBookings = (bookings: Booking[]): Booking[] => {
    let filtered = [...bookings];

    // Filtrage par statut
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (booking) => booking.status.id === filters.status
      );
    }

    return filtered;
  };

  // Fonction pour appliquer le tri
  const sortBookings = (bookings: Booking[]): Booking[] => {
    const sorted = [...bookings];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "dates":
          comparison = compareAsc(
            new Date(a.arrival_date),
            new Date(b.arrival_date)
          );
          break;
        case "name":
          const nameA = `${a.fname} ${a.lname}`.toLowerCase();
          const nameB = `${b.fname} ${b.lname}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "status":
          comparison = a.status.id - b.status.id;
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  };

  // Résultat filtré et trié
  const filteredBookings = useMemo(() => {
    if (!data) return [];
    const filtered = filterBookings(data);
    return sortBookings(filtered);
  }, [data, filters]);

  // Fonction pour mettre à jour les filtres
  const updateFilters = (newFilters: Partial<BookingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const updateBookingStatus = async (
    bookingId: number,
    action: "confirm" | "terminate" | "cancel" | "payment"
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update booking");
      }

      await mutate(); // refresh SWR
      return true;
    } catch (error) {
      console.error("Error updating booking:", error);
      return false;
    }
  };

  return {
    bookings: filteredBookings,
    allBookings: data ?? [],
    isLoading,
    isError: error,
    refresh: mutate,
    updateBookingStatus,
    filters,
    updateFilters,
    resetFilters,
  };
}
