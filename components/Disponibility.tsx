import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import SectionTitle from "@/components/SectionTitle";
import CustomDayPicker from "@/components/CustomDayPicker";
import { FaRegCalendarAlt } from "react-icons/fa";

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
    <section className="pt-5 bg-base-200">
      <div>
        <SectionTitle>Disponibilité</SectionTitle>
        <div className="flex flex-col gap-4 items-center pb-5">
          <CustomDayPicker mode="readOnly" />
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
          <button
            popoverTarget="rdp-popover"
            className="input input-primary input-border"
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
