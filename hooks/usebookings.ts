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

  const updateBookingStatus = async (
    bookingId: number,
    action: "confirm" | "terminate" | "cancel"
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
    bookings: data ?? [],
    isLoading,
    isError: error,
    refresh: mutate,
    updateBookingStatus,
  };
}
