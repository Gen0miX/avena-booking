import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { BookingInput, Booking } from "@/lib/bookings";
import { sendBookingEmail } from "@/lib/email";
import { sendTelegramNotification } from "@/utils/telegram";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

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
      is_paid,
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
  try {
    const body = await request.json();
    const { token, ...bookingData }: { token: string } & BookingInput = body;

    const arrivalDate = new Date(bookingData.arrival_date);
    const departureDate = new Date(bookingData.departure_date);

    // reCAPTCHA
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(token)}`,
        signal: AbortSignal.timeout(5000),
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

    // Insertion et récupération de la ligne créée
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          arrival_date: arrivalDate.toISOString(),
          departure_date: departureDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Insert error", details: error },
        { status: 500 }
      );
    }

    // Envoi de l'email en arrière-plan
    after(() => {
      sendBookingEmail({
        to: booking.mail,
        fname: booking.fname,
        lname: booking.lname,
        arrival_date: booking.arrival_date,
        departure_date: booking.departure_date,
        price: booking.price,
        bookingId: booking.id,
      }).catch((emailError) => {
        console.error("Erreur d'envoi de l'email:", emailError);
      });

      sendTelegramNotification("booking", {
        name: `${booking.fname} ${booking.lname}`,
        arrival: booking.arrival_date,
        departure: booking.departure_date,
      }).catch((tgError) => {
        console.error("Erreur d'envoi Telegram booking :", tgError);
      });
    });

    // Retourner directement l'objet booking
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
