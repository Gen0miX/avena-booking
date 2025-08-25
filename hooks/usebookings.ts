import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur de chargement");
  }

  return res.json();
};

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR("/api/bookings", fetcher);

  const confirmBooking = async (bookingId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm booking");
      }

      // Rafraîchir la liste des réservations avec SWR après confirmation
      await mutate();
      return true;
    } catch (error) {
      console.error("Error confirming booking:", error);
      return false;
    }
  };

  return {
    bookings: data ?? [], // Directement data au lieu de data.bookings
    isLoading,
    isError: error,
    refresh: mutate,
    confirmBooking,
  };
}
