"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartData } from "@/lib/statistics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { useChartTheme } from "@/hooks/useChartTheme";

interface ReservationsChartProps {
  data: ChartData;
}

export default function ReservationsChart({ data }: ReservationsChartProps) {
  const { textColor, gridColor } = useChartTheme();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
            color: textColor,
        }
      },
      title: {
        display: false,
        text: "Nombre de réservations",
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: textColor,
                stepSize: 1
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
                color: gridColor,
            }
        }
    }
  };

  return <Bar options={options} data={data} />;
}
