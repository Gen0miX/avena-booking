"use client";

import Hero from "@/components/Hero";
import Disponibility from "@/components/Disponibility";
import { Booking, getBookings } from "@/utils/bookings";

export default function Home() {
  let bookings: Promise<Booking[]>;
  bookings = getBookings();

  console.log(bookings);

  return (
    <>
      <Hero></Hero>
      <Disponibility></Disponibility>
    </>
  );
}
