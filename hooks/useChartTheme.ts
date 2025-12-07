import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useChartTheme = () => {
  const { resolvedTheme } = useTheme();
  const [textColor, setTextColor] = useState("#000000");
  const [gridColor, setGridColor] = useState("#e5e7eb");

  useEffect(() => {
    if (resolvedTheme === "avenad") {
      // Dark theme
      setTextColor("#e5e7eb"); // gray-200
      setGridColor("#374151"); // gray-700
    } else {
      // Light theme (avenal or default)
      setTextColor("#1f2937"); // gray-800
      setGridColor("#e5e7eb"); // gray-200
    }
  }, [resolvedTheme]);

  return { textColor, gridColor };
};
