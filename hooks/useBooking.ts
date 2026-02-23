import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useBooking(id: number) {
  const { data, error, mutate } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  const updateBooking = async (updates: {
    arrival_date?: string;
    departure_date?: string;
    no_adults?: number;
    no_childs?: number | null;
    mail?: string | null;
    phone?: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
    birthdate?: string | null;
    price?: number;
    is_paid?: boolean;
    is_cleaning?: boolean;
  }) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      await mutate(); // refresh SWR
      return true;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw error;
    }
  };

  return {
    booking: data,
    loading: !data && !error,
    error,
    refresh: mutate,
    updateBooking,
  };
}
