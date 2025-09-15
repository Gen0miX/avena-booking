import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendBookingCancellationEmail } from "@/lib/email";
import { sendTelegramNotification } from "@/utils/telegram";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function PATCH(
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

    // Vérifier l'authentification de l'admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les détails de la réservation avant la mise à jour
    const { data: bookingData, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", parsedId)
      .single();

    if (fetchError || !bookingData) {
      return NextResponse.json(
        { error: "Booking not found", details: fetchError },
        { status: 404 }
      );
    }

    // Vérifier que la réservation est bien en attente (status 1) ou confirmée (status 2)
    if (bookingData.status !== 1 && bookingData.status !== 2) {
      return NextResponse.json(
        { error: "Booking is not pending cancelation" },
        { status: 400 }
      );
    }

    // Mettre à jour le status à 4 (annulée)
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: 4 })
      .eq("id", parsedId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to cancel booking", details: updateError },
        { status: 500 }
      );
    }

    after(() => {
      sendBookingCancellationEmail({
        to: bookingData.mail,
        fname: bookingData.fname,
        lname: bookingData.lname,
        arrival_date: bookingData.arrival_date,
        departure_date: bookingData.departure_date,
        bookingId: bookingData.id,
      }).catch((emailError) => {
        console.error("Erreur d'envoi de l'email d'annulation :", emailError);
      });

      sendTelegramNotification("cancel", {
        name: `${bookingData.fname} ${bookingData.lname}`,
        arrival: bookingData.arrival_date,
        departure: bookingData.departure_date,
      }).catch((tgError) => {
        console.error("Erreur d'envoi Telegram annulation :", tgError);
      });
    });

    return NextResponse.json(
      { message: "Booking canceled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans PATCH cancel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
