import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import CustomDayPicker from "@/components/CustomDayPicker";
import TravelersSelector from "@/components/TravelersSelector";
import { calculatePrice } from "@/utils/priceCalculator";
import { FaRegCalendarAlt, FaArrowRight } from "react-icons/fa";

export default function Disponibility() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [travelers, setTravelers] = useState({
    adults: 0,
    children: 0,
  });
  const [price, setPrice] = useState<number | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (range?.from && range?.to) {
      const nights =
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24);

      if (nights < 2) {
        setDateError("Le minimum de séjour est de 2 nuits.");
      } else {
        setDateError(null); // Réinitialise s'il n'y a plus d'erreur
      }

      if (
        travelers.adults + travelers.children <= 5 &&
        travelers.adults > 0 &&
        nights >= 2
      ) {
        const calculated = calculatePrice(
          range.from,
          range.to,
          travelers.adults
        );
        setPrice(calculated);
      } else {
        setPrice(null);
      }
    } else {
      setDateError(null); // Réinitialise s'il n'y a pas de sélection complète
      setPrice(null);
    }
  }, [range, travelers]);

  return (
    <>
      <section className="flex flex-col sm:sticky sm:top-20 mb-auto mr-auto mt-5 p-5 bg-base-200 drop-shadow-xl rounded-xl border-2 border-primary/40">
        <SectionTitle className="sm:text-4xl!">Disponibilité</SectionTitle>
        <div className="flex flex-col gap-4 mt-10">
          <CustomDayPicker mode="readOnly" />
          <div className="flex flex-col gap-4 pb-5 mt-5">
            <h3 className="font-heading text-3xl font-semibold">Réserver</h3>
            <div className="flex flex-grow w-full">
              <TravelersSelector
                travelers={travelers}
                setTravelers={setTravelers}
              />
            </div>
            <div className="flex gap-2 w-full items-center">
              <button
                popoverTarget="rdp-popover"
                className="flex-grow input input-primary input-border"
                style={{ anchorName: "--rdp" } as React.CSSProperties}
              >
                <FaRegCalendarAlt className="text-base-content/50" />
                {range && range.from && range.to ? (
                  `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                ) : range && range.from ? (
                  range.from.toLocaleDateString()
                ) : (
                  <span className="text-base-content/50">
                    Choisir une période
                  </span>
                )}
              </button>
              <button className="btn btn-primary btn-circle w-8 h-8">
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
      <div
        popover="auto"
        id="rdp-popover"
        className="dropdown"
        style={{ positionAnchor: "--rdp" } as React.CSSProperties}
      >
        <CustomDayPicker
          mode="selectable"
          selectedRange={range}
          onSelect={setRange}
        ></CustomDayPicker>
      </div>
    </>
  );
}
