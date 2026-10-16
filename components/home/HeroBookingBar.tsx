"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowForwardOutline } from "react-icons/io5";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import TravelersSelector from "@/components/TravelersSelector";
import { useBooking } from "@/context/BookingContext";
import {
  APARTMENT_LIST,
  getApartmentBySlug,
  isApartmentSlug,
} from "@/config/apartments";

const fieldLabel =
  "text-[11px] sm:text-xs font-semibold tracking-[0.06em] uppercase text-base-content/70";

export default function HeroBookingBar() {
  const router = useRouter();
  const {
    range,
    setRange,
    travelers,
    setTravelers,
    apartmentSlug,
    setApartmentSlug,
  } = useBooking();
  const [error, setError] = useState<string | null>(null);

  const apartment =
    (apartmentSlug && getApartmentBySlug(apartmentSlug)) || APARTMENT_LIST[0];

  const handleApartmentChange = (slug: string) => {
    if (!isApartmentSlug(slug)) return;
    setApartmentSlug(slug);
    setRange(undefined); // l'occupation diffère d'un appartement à l'autre
  };

  const handleSubmit = () => {
    if (!range?.from || !range?.to) {
      setError("Choisissez vos dates d'arrivée et de départ.");
      return;
    }
    setApartmentSlug(apartment.slug);
    router.push(`/booking?apartment=${apartment.slug}`);
  };

  return (
    <div
      id="reserver"
      className="relative max-w-[1328px] mx-auto -mt-16 sm:-mt-[72px] px-4 sm:px-8 lg:px-14"
    >
      <div className="bg-surface text-base-content rounded-2xl shadow-[0_20px_50px_rgba(43,50,64,0.16)] p-3 sm:p-4">
        <div className="grid grid-cols-2 lg:grid-cols-[1.1fr_1.6fr_1.1fr_auto] gap-2">
          <label className="col-span-2 lg:col-span-1 flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-base-100">
            <span className={fieldLabel}>Appartement</span>
            <select
              className="select select-ghost select-sm px-0 w-full text-base focus:outline-none"
              value={apartment.slug}
              onChange={(e) => handleApartmentChange(e.target.value)}
            >
              {APARTMENT_LIST.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name} · {a.capacity} pers.
                </option>
              ))}
            </select>
          </label>
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-base-100">
            <span className={fieldLabel}>Dates</span>
            <PopoverDatePicker
              apartmentId={apartment.slug}
              selectedRange={range}
              onSelect={(r) => {
                setRange(r);
                setError(null);
              }}
              className="w-full input-sm"
            />
          </div>
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl bg-base-100">
            <span className={fieldLabel}>Voyageurs</span>
            <TravelersSelector
              travelers={travelers}
              setTravelers={setTravelers}
              maxCapacity={apartment.capacity}
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="col-span-2 lg:col-span-1 btn h-auto min-h-12 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 text-base px-6"
          >
            Voir les disponibilités
            <IoArrowForwardOutline size={18} aria-hidden="true" />
          </button>
        </div>
        {error && (
          <p role="alert" className="text-error text-sm font-medium px-2 pt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
