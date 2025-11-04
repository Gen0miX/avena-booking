import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    // Vérifier que la réservation est bien confirmée (status 2)
    if (bookingData.status !== 2) {
      return NextResponse.json(
        { error: "Booking is not pending termination" },
        { status: 400 }
      );
    }

    // Mettre à jour le status à 3 (terminée)
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: 3 })
      .eq("id", parsedId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to confirm booking", details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Booking terminated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans PATCH terminate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
