import useSWR from "swr";
import { PricingPeriod, PricingPeriodInput } from "@/lib/pricingPeriods";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur de chargement");
  }
  return res.json();
};

export function usePricingPeriods() {
  const { data, error, isLoading, mutate } = useSWR<PricingPeriod[]>(
    "/api/pricing-periods",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache pendant 1 minute
    }
  );

  const createPeriod = async (
    period: PricingPeriodInput
  ): Promise<PricingPeriod> => {
    const response = await fetch("/api/pricing-periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(period),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create period");
    }

    const newPeriod = await response.json();
    await mutate();
    return newPeriod;
  };

  const updatePeriod = async (
    id: number,
    period: PricingPeriodInput
  ): Promise<void> => {
    const response = await fetch(`/api/pricing-periods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(period),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update period");
    }

    await mutate();
  };

  const deletePeriod = async (id: number): Promise<void> => {
    const response = await fetch(`/api/pricing-periods/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete period");
    }

    await mutate();
  };

  return {
    periods: data ?? [],
    isLoading,
    isError: error,
    refresh: mutate,
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
}
