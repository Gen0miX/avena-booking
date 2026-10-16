import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TravelersSelector from "@/components/TravelersSelector";
import { getPriceResult } from "@/utils/priceCalculator";
import { useBooking } from "@/context/BookingContext";
import { usePricingPeriods } from "@/hooks/usePricingPeriods";
import PopoverDatePicker from "@/components/PopoverDatePicker";
import { ApartmentConfig, getStartingPrice } from "@/config/apartments";

const fieldLabel =
  "text-[11px] font-semibold tracking-[0.06em] uppercase text-base-content/70";

export default function Disponibility({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const router = useRouter();
  const { range, setRange, travelers, setTravelers, setApartmentSlug } =
    useBooking();
  const { periods } = usePricingPeriods(apartment.slug);
  const [price, setPrice] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleBookingClick = () => {
    if (range?.from && range?.to && travelers.adults > 0) {
      // The booking page resets the dates when the context's apartment differs
      // from the URL's, so align it before navigating to keep the chosen range.
      setApartmentSlug(apartment.slug);
      router.push(`/booking?apartment=${apartment.slug}`);
    } else {
      setDateError("Veuillez sélectionner une période et au moins un adulte.");
    }
  };

  useEffect(() => {
    const { price, error } = getPriceResult({
      start: range?.from,
      end: range?.to,
      adults: travelers.adults,
      customPeriods: periods,
      apartment,
    });

    if (error) {
      setDateError(error);
      setPrice(null);
    } else {
      setDateError(null);
      setPrice(price);
    }
  }, [range, travelers, periods, apartment]);

  return (
    <section
      id="reserver"
      aria-label="Réserver"
      className="bg-surface rounded-2xl shadow-[0_16px_40px_rgba(43,50,64,0.12)] p-5 sm:p-7 flex flex-col gap-4 scroll-mt-24"
    >
      <p className="text-[15px] text-base-content/75">
        <span className="font-heading text-[30px] font-semibold text-base-content">
          CHF {getStartingPrice(apartment)}
        </span>{" "}
        dès / nuit
      </p>
      <div className="flex flex-col gap-1.5">
        <span className={fieldLabel}>Dates</span>
        <PopoverDatePicker
          apartmentId={apartment.slug}
          selectedRange={range}
          onSelect={setRange}
          className="w-full"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className={fieldLabel}>Voyageurs</span>
        <TravelersSelector
          travelers={travelers}
          setTravelers={setTravelers}
          maxCapacity={apartment.capacity}
        />
      </div>
      <div className="flex justify-between items-baseline text-[15px] py-1">
        <span className="text-base-content/75">Prix estimé</span>
        {price !== null ? (
          <span className="font-heading text-2xl font-semibold">
            CHF {price}
          </span>
        ) : (
          <span className="text-base-content/60">Choisissez vos dates</span>
        )}
      </div>
      {dateError && (
        <p role="alert" className="text-error text-sm font-medium">
          {dateError}
        </p>
      )}
      <button
        type="button"
        onClick={handleBookingClick}
        className="btn h-auto min-h-12 rounded-xl border-0 bg-cta text-cta-content hover:bg-cta/90 text-base"
      >
        Réserver
      </button>
      <p className="text-center text-[13px] text-base-content/65">
        Ménage et taxes inclus · Minimum {apartment.minNights} nuits
      </p>
    </section>
  );
}
