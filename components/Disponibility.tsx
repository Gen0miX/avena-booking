import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import CustomDayPicker from "@/components/CustomDayPicker";
import { FaRegCalendarAlt, FaArrowRight } from "react-icons/fa";

export default function Disponibility() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayDate = () => {
    if (range?.from && range?.to) {
      return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
    } else if (range?.from) {
      return range.from.toLocaleDateString();
    } else {
      return "";
    }
  };

  return (
    <section className="flex justify-center pt-5 bg-base m-auto">
      <div className="mx-2 sm:mx-5 pt-5 xl:w-1/2 bg-base-200 rounded-xl border-2 border-primary">
        <SectionTitle>Disponibilité</SectionTitle>
        <p className="text-center pb-5 md:mx-10 xl:mx-20">
          Le calendrier ci-dessous vous indique les disponibilités de
          l’appartement. Choisissez vos dates et remplissez le formulaire pour
          réserver facilement votre séjour dans notre logement tout confort.
        </p>
        <div className="flex flex-col lg:flex-row lg:justify-center gap-4 items-center pb-5">
          <CustomDayPicker mode="readOnly" />
          <div className="flex flex-col gap-4 items-center pb-5 mx-1">
            <h3 className="font-heading text-xl font-medium">Réserver</h3>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-primary"
                placeholder="Prénom"
              />
              <input
                type="text"
                className="input input-primary"
                placeholder="Nom"
              />
            </div>
            <div className="flex gap-2 w-full items-center">
              <button
                popoverTarget="rdp-popover"
                className="flex-grow input input-primary input-border"
                style={{ anchorName: "--rdp" } as React.CSSProperties}
              >
                <FaRegCalendarAlt />
                {range && range.from && range.to ? (
                  `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                ) : range && range.from ? (
                  range.from.toLocaleDateString()
                ) : (
                  <span>Choisir une période</span>
                )}
              </button>
              <button className="btn btn-primary btn-circle w-8 h-8">
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
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
    </section>
  );
}
