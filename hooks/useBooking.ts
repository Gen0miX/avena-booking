import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useBooking(id: number) {
  const { data, error, mutate } = useSWR(
    id ? `/api/bookings/${id}` : null,
    fetcher
  );

  return {
    booking: data,
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}
