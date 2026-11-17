"use client";

import { IoInformationCircleOutline } from "react-icons/io5";
import { useBooking } from "@/context/BookingContext";

/** Message affiché quand le nombre de voyageurs a été ajusté automatiquement. */
export default function TravelersNotice({ className = "" }: { className?: string }) {
  const { travelersNotice } = useBooking();
  if (!travelersNotice) return null;

  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-base-content ${className}`}
    >
      <IoInformationCircleOutline size={18} className="shrink-0 mt-px" aria-hidden="true" />
      {travelersNotice}
    </p>
  );
}
