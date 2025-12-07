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
  Legend
);

import { useChartTheme } from "@/hooks/useChartTheme";

interface AverageStayChartProps {
  data: ChartData;
}

export default function AverageStayChart({ data }: AverageStayChartProps) {
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
        text: "Durée moyenne des séjours",
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: textColor,
                callback: function(value: any) {
                    return value + " nuits";
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
                color: gridColor,
            }
        }
    }
  };

  return <Line options={options} data={data} />;
}
