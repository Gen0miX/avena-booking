import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { BookingInput, Booking } from "@/lib/bookings";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
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
      is_cleaning,
      status (
        id,
        name
      )
    `
    )
    .order("arrival_date", { ascending: true });

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error },
      { status: 500 }
    );
  }

  const typedData: Booking[] = data.map((item) => ({
    ...item,
    arrival_date: new Date(item.arrival_date),
    departure_date: new Date(item.departure_date),
    status: Array.isArray(item.status) ? item.status[0] : item.status,
  }));

  return NextResponse.json(typedData);
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

  const supabase = await createClient();

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
