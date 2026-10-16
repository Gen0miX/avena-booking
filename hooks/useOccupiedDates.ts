import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useOccupiedDates(apartmentId: string | null) {
  const { data, error } = useSWR(
    apartmentId ? `/api/bookings/occupied-dates?apartment=${apartmentId}` : null,
    fetcher
  );

  return {
    dates: (data?.occupiedDates ?? []).map((d: string) => new Date(d)),
    loading: !!apartmentId && !data && !error,
    error,
  };
}
