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

  return {
    bookings: data ?? [], // Directement data au lieu de data.bookings
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
