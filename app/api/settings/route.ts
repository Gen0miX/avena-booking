import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AppSettingsInput, DEFAULT_BOOKING_BLOCKED_AFTER } from "@/lib/settings";
import { getApartmentBySlug } from "@/config/apartments";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (!apartmentParam || !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("apartment_id", apartmentParam)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      id: null,
      apartment_id: apartmentParam,
      booking_blocked_after: DEFAULT_BOOKING_BLOCKED_AFTER,
    });
  }

  return NextResponse.json(data);
}

// PUT: Mettre à jour les paramètres (authentifié)
export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AppSettingsInput & { apartment_id: string } = await request.json();

  if (!getApartmentBySlug(body.apartment_id)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  if (body.booking_blocked_after) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.booking_blocked_after)) {
      return NextResponse.json(
        { error: "Format de date invalide. Utilisez YYYY-MM-DD" },
        { status: 400 }
      );
    }
    const date = new Date(body.booking_blocked_after);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
  }

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .eq("apartment_id", body.apartment_id)
    .maybeSingle();

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
          apartment_id: body.apartment_id,
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
