// components/StatusBadge.tsx
import React from "react";

type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  let badgeClass = "badge"; // classe de base
  let label = status;

  switch (status) {
    case "En attente":
      badgeClass += " badge-warning";
      break;
    case "Confirmée":
      badgeClass += " badge-success";
      break;
    case "Terminée":
      badgeClass += " badge-info";
      break;
    case "Annulée":
      badgeClass += " badge-error";
      break;
    default:
      badgeClass += " badge-ghost";
      label = "Inconnu";
      break;
  }

  return <span className={badgeClass}>{label}</span>;
}
