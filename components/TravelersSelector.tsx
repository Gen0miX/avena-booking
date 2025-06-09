import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Travelers } from "@/utils/bookings";
import { IoPersonAddOutline } from "react-icons/io5";

export default function TravelersSelector({
  travelers,
  setTravelers,
}: {
  travelers: Travelers;
  setTravelers: (val: Travelers) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = travelers.adults + travelers.children;
  const maxReached = total >= 5;

  return (
    <div className="relative w-full" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="input input-primary justify-between w-full"
      >
        <span className="flex items-center gap-2">
          <IoPersonAddOutline className="text-xl text-base-content/70" />
          {total > 0 ? `${total} voyageur${total > 1 ? "s" : ""}` : "Voyageurs"}
        </span>
        <FaChevronDown className="text-base-content/50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-base-100 border border-primary/40 rounded-box shadow p-4 space-y-2">
          {[
            { label: "Adultes", key: "adults", desc: "18 ans et plus" },
            { label: "Enfants", key: "children", desc: "0 à 17 ans" },
          ].map(({ label, key, desc }) => (
            <div key={key} className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{label}</div>
                <div className="text-sm text-base-content/60">{desc}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-xs btn-outline btn-primary btn-circle"
                  disabled={
                    key === "adults"
                      ? travelers.adults === 1
                      : travelers[key as keyof Travelers] === 0
                  }
                  onClick={() =>
                    setTravelers({
                      ...travelers,
                      [key]: Math.max(0, travelers[key as keyof Travelers] - 1),
                    })
                  }
                >
                  –
                </button>
                <span className="w-2">{travelers[key as keyof Travelers]}</span>
                <button
                  className="btn btn-xs btn-outline btn-primary btn-circle"
                  disabled={maxReached}
                  onClick={() =>
                    !maxReached &&
                    setTravelers({
                      ...travelers,
                      [key]: travelers[key as keyof Travelers] + 1,
                    })
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <p className="text-xs text-base-content/60">
            Maximum : 5 voyageurs (adultes + enfants)
          </p>
        </div>
      )}
    </div>
  );
}
