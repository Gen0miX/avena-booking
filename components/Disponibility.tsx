import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import CustomDayPicker from "@/components/CustomDayPicker";
import { FaRegCalendarAlt, FaArrowRight } from "react-icons/fa";

export default function Disponibility() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <>
      <section className="flex flex-col sticky top-10 mb-auto mt-5 p-5 lg:mr-10 xl:mr-20 bg-base-200 drop-shadow-xl rounded-xl border-2 border-primary/40">
        <SectionTitle>Disponibilité</SectionTitle>
        <p className="text-justify py-5 text-sm sm:text-base mb-5 text-base-content/70">
          Le calendrier ci-dessous vous indique les disponibilités de
          l’appartement. Choisissez vos dates et remplissez le formulaire pour
          réserver facilement votre séjour dans notre logement tout confort.
        </p>
        <div className="flex flex-col gap-4">
          <CustomDayPicker mode="readOnly" />
          <div className="flex flex-col gap-4 pb-5 mt-5">
            <h3 className="font-heading text-3xl font-semibold">Réserver</h3>
            <div className="flex w-full gap-2">
              <input
                type="text"
                className="input flex-grow input-primary"
                placeholder="Prénom"
              />
              <input
                type="text"
                className="input flex-grow input-primary"
                placeholder="Nom"
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
