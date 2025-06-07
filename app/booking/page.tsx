"use client";

import {
  IoPersonCircleOutline,
  IoCalendarOutline,
  IoMailOutline,
} from "react-icons/io5";
import { HiOutlinePhone } from "react-icons/hi";
import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import CustomDayPicker from "@/components/CustomDayPicker";
import TravelersSelector from "@/components/TravelersSelector";
import {
  calculatePrice,
  isHighSeason,
  isFamilyRate,
  getNights,
} from "@/utils/priceCalculator";

export default function Booking() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [travelers, setTravelers] = useState({
    adults: 0,
    children: 0,
  });
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (range?.from && range?.to && travelers.adults > 0) {
      const price = calculatePrice(range.from, range.to, travelers.adults);
      setPrice(price);
    } else {
      setPrice(null);
    }
  }, [range, travelers]);

  return (
    <>
      <div className="flex flex-col items-center bg-base-200 lg:max-w-6xl mx-2 md:mx-5 lg:mx-10 xl:mx-auto mt-5 rounded-box border border-primary/40">
        <h1 className="font-heading text-4xl font-semibold">Réservation</h1>
        <div className="flex flex-col sm:flex-row gap-4 pb-5 pt-5 sm:pt-5 sm:pb-5 px-2">
          <fieldset className="fieldset bg-base-300 border-primary/40 rounded-box border p-2 sm:p-4 shadow-lg">
            <legend className="fieldset-legend text-xl font-medium">
              Données personnelles
            </legend>
            <div className="flex flex-col lg:flex-row gap-2">
              <label className="input input-primary lg:flex-1">
                <IoPersonCircleOutline className="text-xl text-base-content/70"></IoPersonCircleOutline>
                <input type="text" className="" placeholder="Nom" />
              </label>

              <label className="input input-primary lg:flex-1">
                <IoPersonCircleOutline className="text-xl text-base-content/70"></IoPersonCircleOutline>
                <input type="text" className="" placeholder="Prénom" />
              </label>
            </div>
            <div className="flex flex-col lg:flex-row gap-2">
              <label className="input input-primary validator lg:flex-1">
                <IoMailOutline className="text-xl text-base-content/70"></IoMailOutline>
                <input type="email" required placeholder="email" />
              </label>

              <label className="input validator input-primary lg:flex-1">
                <HiOutlinePhone className="text-xl text-base-content/70"></HiOutlinePhone>
                <input
                  type="text"
                  className="validator tabular-nums"
                  placeholder="téléphone"
                  pattern="[0-9]*"
                  required
                />
              </label>
            </div>

            <TravelersSelector
              travelers={travelers}
              setTravelers={setTravelers}
            />

            <button
              popoverTarget="rdp-popover"
              className="flex-grow input input-primary input-border w-full"
              style={{ anchorName: "--rdp" } as React.CSSProperties}
            >
              <IoCalendarOutline className="text-xl text-base-content/70" />
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
            <label className="label">
              <input type="checkbox" className="checkbox checkbox-primary" />
              Ménage
            </label>
          </fieldset>
          <fieldset className="fieldset bg-base-300 border-primary/40 rounded-box border p-2 sm:p-4 shadow-lg w-full sm:w-52">
            <legend className="fieldset-legend text-xl font-medium">
              Prix
            </legend>
            {range?.from && range?.to && travelers.adults > 0 ? (
              <>
                <p>
                  <span className="font-semibold">Saison :</span>{" "}
                  {isHighSeason(range.from, range.to) ? "Haute" : "Basse"}
                </p>
                <p>
                  <span className="font-semibold">Tarif :</span>{" "}
                  {isFamilyRate(travelers.adults) ? "Famille" : "Plein"}
                </p>
                <p>
                  <span className="font-semibold">Nuits :</span>{" "}
                  {getNights(range.from, range.to)}
                </p>
                <div className="divider my-0"></div>
                <p className="text-center text-lg font-medium">
                  <span className="font-semibold">
                    Prix total <br />
                  </span>
                  {price?.toLocaleString("fr-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </p>
              </>
            ) : (
              <p className="text-base-content/50">
                Sélectionnez une période et le nombre de voyageurs.
              </p>
            )}
          </fieldset>
        </div>
        <button className="btn btn-primary mb-5">Réserver</button>
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
    </>
  );
}
