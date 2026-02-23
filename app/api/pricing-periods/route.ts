import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PricingPeriodInput } from "@/lib/pricingPeriods";

export const dynamic = "force-dynamic";

// GET: Récupérer toutes les périodes tarifaires (public)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pricing_periods")
    .select("*")
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

  const body: PricingPeriodInput = await request.json();

  // Valider les champs requis
  if (
    !body.name ||
    !body.start_date ||
    !body.end_date ||
    body.price_standard == null ||
    body.price_five == null
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Valider que end_date > start_date
  if (body.end_date <= body.start_date) {
    return NextResponse.json(
      { error: "La date de fin doit être après la date de début" },
      { status: 400 }
    );
  }

  // Vérifier les chevauchements
  const { data: overlaps, error: overlapError } = await supabase
    .from("pricing_periods")
    .select("id, name")
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
