import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useBookings() {
  const { data, error, mutate } = useSWR("/api/bookings", fetcher);

  return {
    bookings: data?.bookings || [],
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}
