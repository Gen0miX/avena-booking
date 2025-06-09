import { createClient } from "@/utils/supabase/client";
import { Status } from "@/utils/status";

export type Travelers = {
  adults: number;
  children: number;
};

export interface Booking {
  id: number;
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  no_adults: number;
  no_childs?: number;
  status: Status;
  arrival_date: Date;
  departure_date: Date;
  price: number;
}

export interface BookingInput {
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  no_adults: number;
  no_childs?: number;
  status: number;
  arrival_date: Date;
  departure_date: Date;
  price: number;
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("bookings").select(`
      id,
      fname,
      lname,
      mail,
      phone,
      no_adults,
      no_childs,
      arrival_date,
      departure_date,
      price,
      status:status (
        id,
        name
      )
    `);

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  // Map the data to match the Booking interface
  return (data ?? []).map((booking: any) => ({
    ...booking,
    status: Array.isArray(booking.status) ? booking.status[0] : booking.status,
    arrival_date: booking.arrival_date ? new Date(booking.arrival_date) : null,
    departure_date: booking.departure_date
      ? new Date(booking.departure_date)
      : null,
  })) as Booking[];
}

export async function addBooking(booking: BookingInput): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").insert([
    {
      ...booking,
      arrival_date: booking.arrival_date.toISOString(),
      departure_date: booking.departure_date.toISOString(),
    },
  ]);
  if (error) {
    console.error("Error adding booking:", error);
    return false;
  }
  return true;
}

export async function updateBooking(
  id: number,
  updates: Partial<BookingInput>
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      ...updates,
      ...(updates.arrival_date && {
        arrival_date: updates.arrival_date.toISOString(),
      }),
      ...(updates.departure_date && {
        departure_date: updates.departure_date.toISOString(),
      }),
    })
    .eq("id", id);
  if (error) {
    console.error("Error updating booking:", error);
    return false;
  }
  return true;
}

export async function deleteBooking(id: number): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    console.error("Error delete booking:", error);
    return false;
  }
  return true;
}

export async function fetchOccupiedDates(): Promise<Date[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("arrival_date, departure_date");

  console.log("Supabase data:", data);
  console.log("Supabase error:", error);

  if (error) {
    console.error("Erreur lors de la récupération des réservations : ", error);
    return [];
  }

  const occupiedDates: Date[] = [];

  data?.forEach((booking) => {
    const start = new Date(booking.arrival_date);
    const end = new Date(booking.departure_date);

    // Normalise à minuit
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      day.setHours(0, 0, 0, 0); // Normalise chaque jour
      occupiedDates.push(day);
    }
  });

  return occupiedDates;
}
