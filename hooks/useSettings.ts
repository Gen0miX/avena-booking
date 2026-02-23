import useSWR from "swr";
import { AppSettings, AppSettingsInput } from "@/lib/settings";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur de chargement");
  }
  return res.json();
};

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<AppSettings>(
    "/api/settings",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache pendant 1 minute
    }
  );

  const updateSettings = async (
    settings: AppSettingsInput
  ): Promise<AppSettings> => {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update settings");
    }

    const updatedSettings = await response.json();
    await mutate();
    return updatedSettings;
  };

  return {
    settings: data,
    isLoading,
    isError: error,
    refresh: mutate,
    updateSettings,
  };
}
