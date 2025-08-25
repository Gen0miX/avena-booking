import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendBookingConfirmationEmail } from "@/lib/email";

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

    // Vérifier que la réservation est bien en attente (status 1)
    if (bookingData.status !== 1) {
      return NextResponse.json(
        { error: "Booking is not pending confirmation" },
        { status: 400 }
      );
    }

    // Mettre à jour le status à 2 (confirmée)
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: 2 })
      .eq("id", parsedId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to confirm booking", details: updateError },
        { status: 500 }
      );
    }

    // Envoyer l'email de confirmation en arrière-plan
    after(() => {
      sendBookingConfirmationEmail({
        to: bookingData.mail,
        fname: bookingData.fname,
        lname: bookingData.lname,
        arrival_date: bookingData.arrival_date,
        departure_date: bookingData.departure_date,
        price: bookingData.price,
      }).catch((emailError) => {
        console.error("Erreur d'envoi de l'email de confirmation:", emailError);
      });
    });

    return NextResponse.json(
      { message: "Booking confirmed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans PATCH confirm:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
