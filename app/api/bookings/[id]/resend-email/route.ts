import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendBookingEmail } from "@/lib/email";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Auth admin requise
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les infos de la réservation
    const { data: bookingData, error: fetchError } = await supabase
      .from("bookings")
      .select(`id,fname,lname,mail,arrival_date,departure_date,price`)
      .eq("id", parsedId)
      .single();

    if (fetchError || !bookingData) {
      return NextResponse.json(
        { error: "Booking not found", details: fetchError },
        { status: 404 }
      );
    }

    if (!bookingData.mail) {
      return NextResponse.json(
        { error: "No email set for this booking" },
        { status: 400 }
      );
    }

    // Envoyer l'email de réservation
    await sendBookingEmail({
      to: bookingData.mail,
      fname: bookingData.fname,
      lname: bookingData.lname,
      arrival_date: bookingData.arrival_date,
      departure_date: bookingData.departure_date,
      price: bookingData.price,
      bookingId: bookingData.id,
    });

    return NextResponse.json(
      { message: "Booking email resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du renvoi d'email de réservation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
