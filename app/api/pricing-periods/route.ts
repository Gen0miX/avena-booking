import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { parsePricingPeriodInput } from "@/lib/pricingPeriods";
import { getApartmentBySlug } from "@/config/apartments";

export const dynamic = "force-dynamic";

// GET: Récupérer toutes les périodes tarifaires d'un appartement (public)
export async function GET(request: NextRequest) {
  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (!apartmentParam || !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pricing_periods")
    .select("*")
    .eq("apartment_id", apartmentParam)
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch pricing periods", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST: Créer une nouvelle période tarifaire (authentifié)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parsePricingPeriodInput(await request.json().catch(() => null));
  if (parsed.error !== null) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  if (!getApartmentBySlug(body.apartment_id)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  // Vérifier les chevauchements
  const { data: overlaps, error: overlapError } = await supabase
    .from("pricing_periods")
    .select("id, name")
    .eq("apartment_id", body.apartment_id)
    .lt("start_date", body.end_date)
    .gt("end_date", body.start_date);

  if (overlapError) {
    return NextResponse.json(
      { error: "Error checking overlaps", details: overlapError },
      { status: 500 }
    );
  }

  if (overlaps && overlaps.length > 0) {
    return NextResponse.json(
      {
        error: "Cette période chevauche une période existante",
        overlapping: overlaps.map((p) => p.name),
      },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("pricing_periods")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Insert error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
