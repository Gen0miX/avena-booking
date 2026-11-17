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

interface RevenueChartProps {
  data: ChartData;
}

export default function RevenueChart({ data }: RevenueChartProps) {
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
        text: "Revenus générés",
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: textColor,
                callback: function(value: any) {
                    return value + " CHF";
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
    }
  };

  return <Bar options={options} data={styleData(data, "revenue")} />;
}
