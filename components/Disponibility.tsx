import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import CustomDayPicker from "@/components/CustomDayPicker";
import TravelersSelector from "@/components/TravelersSelector";
import { getPriceResult } from "@/utils/priceCalculator";
import { useBooking } from "@/context/BookingContext";
import { FaArrowRight } from "react-icons/fa";
import PopoverDatePicker from "@/components/PopoverDatePicker";

export default function Disponibility() {
  const router = useRouter();
  const { range, setRange, travelers, setTravelers } = useBooking();
  const [price, setPrice] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleBookingClick = () => {
    if (range?.from && range?.to && travelers.adults > 0) {
      router.push("/booking");
    } else {
      setDateError("Veuillez sélectionner une période et au moins un adulte.");
    }
  };

  useEffect(() => {
    const { price, error } = getPriceResult({
      start: range?.from,
      end: range?.to,
      adults: travelers.adults,
    });

    if (error) {
      setDateError(error);
      setPrice(null);
    } else {
      setDateError(null);
      setPrice(price);
    }
  }, [range, travelers]);

  return (
    <>
      <section className="flex flex-col w-full lg:max-w-[310px] sm:sticky sm:top-20 mb-auto mr-auto mt-5 p-5 pt-2 bg-base-200 drop-shadow-xl rounded-xl border-2 border-primary/40">
        <SectionTitle className="sm:text-4xl!">Disponibilité</SectionTitle>
        <div className="flex flex-col gap-4 mt-3">
          <CustomDayPicker mode="readOnly" />
          <div className="flex flex-col gap-4 pb-2 mt-2">
            <h3 className="font-heading text-3xl font-semibold">Réserver</h3>
            <div className="flex flex-grow w-full">
              <TravelersSelector
                travelers={travelers}
                setTravelers={setTravelers}
              />
            </div>
            <div className="flex gap-2 w-full items-center">
              <PopoverDatePicker
                selectedRange={range}
                onSelect={setRange}
                className="flex-grow"
              />
              <button
                onClick={handleBookingClick}
                className="btn btn-primary btn-circle w-8 h-8"
              >
                <FaArrowRight />
              </button>
            </div>
            {dateError && (
              <p className="text-error text-sm font-medium">{dateError}</p>
            )}
            {price !== null && (
              <div className="text-xl font-semibold">
                Prix estimé : <span className="text-primary">{price} CHF</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
