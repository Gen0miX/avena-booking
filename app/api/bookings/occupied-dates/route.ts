import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("arrival_date, departure_date");

  if (error) {
    return NextResponse.json(
      { message: "Erreur lors de la récupération des dates", details: error },
      { status: 500 }
    );
  }

  const occupiedDates: string[] = [];

  data?.forEach((booking) => {
    const start = new Date(booking.arrival_date);
    const end = new Date(booking.departure_date);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      occupiedDates.push(day.toISOString());
    }
  });

  return NextResponse.json({ occupiedDates });
}
