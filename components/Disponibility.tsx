import { DayPicker } from "react-day-picker";
import { useState } from "react";

export default function Disponibility() {
  return (
    <section className="bg-base-200">
      <div>
        <h1 className="font-heading text-center text-xl">Disponibilité</h1>
        <DayPicker className="react-day-picker"></DayPicker>
      </div>
    </section>
  );
}
