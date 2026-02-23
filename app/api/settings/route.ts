import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AppSettingsInput, DEFAULT_BOOKING_BLOCKED_AFTER } from "@/lib/settings";

export const dynamic = "force-dynamic";

// GET: Récupérer les paramètres (public pour le calendrier)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .single();

  if (error) {
    // Si la table n'existe pas ou pas de données, retourner les valeurs par défaut
    if (error.code === "PGRST116") {
      return NextResponse.json({
        id: 1,
        booking_blocked_after: DEFAULT_BOOKING_BLOCKED_AFTER,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// PUT: Mettre à jour les paramètres (authentifié)
export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AppSettingsInput = await request.json();

  // Valider le format de la date si fournie
  if (body.booking_blocked_after) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.booking_blocked_after)) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Vérifier que la date est valide
    const date = new Date(body.booking_blocked_after);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Date invalide" },
        { status: 400 }
      );
    }
  }

  // Essayer de mettre à jour, sinon insérer
  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("settings")
      .update({
        booking_blocked_after: body.booking_blocked_after,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("settings")
      .insert([
        {
          booking_blocked_after: body.booking_blocked_after,
        },
      ])
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json(
      { error: "Failed to update settings", details: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
