import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { PricingPeriodInput } from "@/lib/pricingPeriods";

// GET: Récupérer une période tarifaire spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pricing_periods")
    .select("*")
    .eq("id", parsedId)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Period not found", details: error },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

// PUT: Modifier une période tarifaire
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
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

  // Valider que end_date > start_date
  if (body.end_date <= body.start_date) {
    return NextResponse.json(
      { error: "La date de fin doit être après la date de début" },
      { status: 400 }
    );
  }

  // Vérifier les chevauchements (en excluant la période actuelle)
  const { data: overlaps, error: overlapError } = await supabase
    .from("pricing_periods")
    .select("id, name")
    .neq("id", parsedId)
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

  const { error } = await supabase
    .from("pricing_periods")
    .update(body)
    .eq("id", parsedId);

  if (error) {
    return NextResponse.json(
      { error: "Update error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Period updated" });
}

// DELETE: Supprimer une période tarifaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const supabase = await createClient();

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("pricing_periods")
    .delete()
    .eq("id", parsedId);

  if (error) {
    return NextResponse.json(
      { error: "Delete error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Period deleted" });
}
