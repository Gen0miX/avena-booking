import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="stats shadow bg-base-100 border border-primary/20">
      <div className="stat">
        {icon && <div className="stat-figure text-secondary">{icon}</div>}
        <div className="stat-title text-base-content">{title}</div>
        <div className="stat-value text-primary">{value}</div>
        {description && <div className="stat-desc">{description}</div>}
      </div>
    </div>
  );
}
