import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ChartData } from "@/lib/statistics";

export type ChartMetric = "occupancy" | "revenue" | "reservations" | "avgStay";

// Couleurs des séries alignées sur la charte du site, avec une variante
// plus claire en thème sombre pour garder le contraste sur les cartes.
const SERIES: Record<"light" | "dark", Record<ChartMetric, string>> = {
  light: {
    occupancy: "#4E6B65",
    revenue: "#3F5578",
    reservations: "#8A6647",
    avgStay: "#4E6B65",
  },
  dark: {
    occupancy: "#9FD3D6",
    revenue: "#9DB7E0",
    reservations: "#D9B48F",
    avgStay: "#9FD3D6",
  },
};

export const useChartTheme = () => {
  const { resolvedTheme } = useTheme();
  const [textColor, setTextColor] = useState("#5A6273");
  const [gridColor, setGridColor] = useState("#EEF1F3");
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (resolvedTheme === "avenad") {
      setTextColor("#C9D0D6");
      setGridColor("rgba(255,255,255,0.08)");
      setMode("dark");
    } else {
      setTextColor("#5A6273");
      setGridColor("#EEF1F3");
      setMode("light");
    }
  }, [resolvedTheme]);

  /** Applique la couleur de la série et un style sobre (barres arrondies, courbes lissées). */
  const styleData = (data: ChartData, metric: ChartMetric): ChartData => {
    const color = SERIES[mode][metric];
    return {
      ...data,
      datasets: data.datasets.map((d) => ({
        ...d,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        borderRadius: 6,
        maxBarThickness: 28,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: color,
      })),
    };
  };

  return { textColor, gridColor, styleData };
};
