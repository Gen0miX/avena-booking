import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { BookingInput } from "@/lib/bookings";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET() {
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
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

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

  try {
    await sendBookingConfirmationEmail({
      to: bookingData.mail,
      fname: bookingData.fname,
      lname: bookingData.lname,
      arrival_date: arrivalDate.toISOString(),
      departure_date: departureDate.toISOString(),
      price: bookingData.price,
    });
  } catch (emailError) {
    console.error("Erreur d'envoi de l'email de confirmation", emailError);
  }

  return NextResponse.json({ message: "Booking created" }, { status: 200 });
}
