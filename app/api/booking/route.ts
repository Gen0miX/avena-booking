import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { BookingInput } from "@/utils/bookings";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { token, ...bookingData }: { token: string } & BookingInput = body;

  const arrivalDate = new Date(bookingData.arrival_date);
  const departureDate = new Date(bookingData.departure_date);

  const recaptchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${
        process.env.RECAPTCHA_SECRET_KEY
      }&response=${encodeURIComponent(token)}`,
    }
  );

  const captchaData = await recaptchaResponse.json();
  if (!captchaData.success || captchaData.score < 0.5) {
    return NextResponse.json(
      { message: "Captcha verification failed" },
      { status: 403 }
    );
  }

  const supabase = createClient();

  const { error } = await supabase.from("bookings").insert([
    {
      ...bookingData,
      arrival_date: arrivalDate.toISOString(),
      departure_date: departureDate.toISOString(),
    },
  ]);

  if (error) {
    return NextResponse.json(
      { error: "Insert error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Booking created" }, { status: 200 });
}
