"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { Travelers } from "@/lib/bookings";
import { ApartmentSlug } from "@/config/apartments";

type BookingContextType = {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  travelers: Travelers;
  setTravelers: (travelers: Travelers) => void;
  apartmentSlug: ApartmentSlug | null;
  setApartmentSlug: (slug: ApartmentSlug | null) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [travelers, setTravelers] = useState<Travelers>({ adults: 1, children: 0 });
  const [apartmentSlug, setApartmentSlug] = useState<ApartmentSlug | null>(null);

  return (
    <BookingContext.Provider
      value={{ range, setRange, travelers, setTravelers, apartmentSlug, setApartmentSlug }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
