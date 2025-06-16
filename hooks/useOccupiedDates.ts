import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useOccupiedDates() {
  const { data, error } = useSWR("/api/bookings/occupied-dates", fetcher);

  return {
    dates: (data?.occupiedDates ?? []).map((d: string) => new Date(d)),
    loading: !data && !error,
    error,
  };
}
