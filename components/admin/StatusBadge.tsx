// components/StatusBadge.tsx
import React from "react";

type StatusBadgeProps = {
  status: string;
  loading?: boolean;
};

const TONE: Record<string, string> = {
  "En attente": "badge-warning",
  Confirmée: "badge-success",
  Terminée: "badge-info",
  Annulée: "badge-error",
};

export default function StatusBadge({ status, loading }: StatusBadgeProps) {
  const tone = TONE[status];
  const label = tone ? status : "Inconnu";

  return (
    <span
      className={`badge badge-soft ${tone ?? "badge-ghost"} gap-1.5 rounded-full font-semibold text-[13px] min-w-24`}
    >
      {loading ? (
        <span className="loading loading-ring loading-sm"></span>
      ) : (
        <>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          {label}
        </>
      )}
    </span>
  );
}
