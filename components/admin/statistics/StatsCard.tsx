import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  /** 0–100 : affiche une jauge sous la valeur */
  progress?: number;
}

export default function StatsCard({ title, value, description, progress }: StatsCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-5 flex flex-col gap-1.5">
      <p className="text-[13px] font-semibold text-base-content/75">{title}</p>
      <p className="font-heading text-[26px] sm:text-[34px] font-semibold leading-tight">
        {value}
      </p>
      {progress !== undefined && (
        <div aria-hidden="true" className="h-1.5 rounded-full bg-base-200 overflow-hidden mt-1">
          <div
            className="h-full bg-cta"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {description && (
        <p className="text-[13px] text-base-content/65">{description}</p>
      )}
    </div>
  );
}
