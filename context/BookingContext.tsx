"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { DateRange } from "react-day-picker";
import { Travelers } from "@/lib/bookings";
import { ApartmentSlug } from "@/config/apartments";

type BookingContextType = {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  travelers: Travelers;
  /** Changement fait par le visiteur : efface l'éventuel message d'ajustement. */
  setTravelers: (travelers: Travelers) => void;
  /** Ajustement automatique (ex. capacité dépassée) accompagné d'un message. */
  adjustTravelers: (travelers: Travelers, notice: string) => void;
  travelersNotice: string | null;
  apartmentSlug: ApartmentSlug | null;
  setApartmentSlug: (slug: ApartmentSlug | null) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [travelers, setTravelersState] = useState<Travelers>({ adults: 1, children: 0 });
  const [travelersNotice, setTravelersNotice] = useState<string | null>(null);
  const [apartmentSlug, setApartmentSlug] = useState<ApartmentSlug | null>(null);

  const setTravelers = useCallback((value: Travelers) => {
    setTravelersState(value);
    setTravelersNotice(null);
  }, []);

  const adjustTravelers = useCallback((value: Travelers, notice: string) => {
    setTravelersState(value);
    setTravelersNotice(notice);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        range,
        setRange,
        travelers,
        setTravelers,
        adjustTravelers,
        travelersNotice,
        apartmentSlug,
        setApartmentSlug,
      }}
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
