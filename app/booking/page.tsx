"use client";

import {
  IoPersonCircleOutline,
  IoCalendarOutline,
  IoMailOutline,
} from "react-icons/io5";
import { HiOutlinePhone } from "react-icons/hi";
import { LuLollipop, LuCoffee } from "react-icons/lu";
import { DateRange } from "react-day-picker";
import { useEffect, useState, useRef } from "react";
import CustomDayPicker from "@/components/CustomDayPicker";

export default function Booking() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  return (
    <>
      <fieldset className="fieldset bg-base-200 border-base-200/40 rounded-box border">
        <legend className="fieldset-legend font-heading text-xl font-semibold">
          Réservation
        </legend>
        <label className="input input-primary">
          <IoPersonCircleOutline className="text-xl text-base-content/70"></IoPersonCircleOutline>
          <input type="text" className="" placeholder="Nom" />
        </label>

        <label className="input input-primary">
          <IoPersonCircleOutline className="text-xl text-base-content/70"></IoPersonCircleOutline>
          <input type="text" className="" placeholder="Prénom" />
        </label>
        <div>
          <label className="input input-primary">
            <IoMailOutline className="text-xl text-base-content/70"></IoMailOutline>
            <input
              type="email"
              className="validator"
              required
              placeholder="email"
            />
          </label>
        </div>

        <label className="input input-primary">
          <HiOutlinePhone className="text-xl text-base-content/70"></HiOutlinePhone>
          <input
            type="text"
            className="validator tabular-nums"
            placeholder="téléphone"
            required
          />
        </label>

        <label className="input input-primary">
          <LuCoffee className="text-xl text-base-content/70"></LuCoffee>
          <input
            type="number"
            className="validator tabular-nums"
            placeholder="Nombre d'adultes"
            required
          />
        </label>

        <label className="input input-primary">
          <LuLollipop className="text-xl text-base-content/70"></LuLollipop>
          <input
            type="number"
            className="validator tabular-nums"
            placeholder="Nombre d'enfants"
            required
          />
        </label>

        <button
          popoverTarget="rdp-popover"
          className="flex-grow input input-primary input-border"
          style={{ anchorName: "--rdp" } as React.CSSProperties}
        >
          <IoCalendarOutline className="text-xl text-base-content/70" />
          {range && range.from && range.to ? (
            `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
          ) : range && range.from ? (
            range.from.toLocaleDateString()
          ) : (
            <span className="text-base-content/50">Choisir une période</span>
          )}
        </button>
      </fieldset>
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
