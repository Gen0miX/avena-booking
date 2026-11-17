"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChartData } from "@/lib/statistics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { useChartTheme } from "@/hooks/useChartTheme";

interface OccupancyChartProps {
  data: ChartData;
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  const { textColor, gridColor, styleData } = useChartTheme();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
            color: textColor,
        }
      },
      title: {
        display: false,
        text: "Taux d'occupation",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
            color: textColor,
            callback: function(value: any) {
                return value + "%";
            }
        },
        grid: {
            color: gridColor,
        }
      },
      x: {
          ticks: {
              color: textColor,
          },
          grid: {
              display: false,
          }
      }
    },
  };

  return <Line options={options} data={styleData(data, "occupancy")} />;
}
