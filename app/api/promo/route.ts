import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { APARTMENT_LIST, getApartmentBySlug } from "@/config/apartments";
import { isIsoDate } from "@/lib/promo";

export const dynamic = "force-dynamic";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

// GET: liste des codes promo (admin) — ?apartment=<slug>|all
export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apartmentParam = request.nextUrl.searchParams.get("apartment") ?? "all";
  if (apartmentParam !== "all" && !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  let query = supabase
    .from("promo_code")
    .select("id, created_at, name, percentage, active, apartment_id, valid_from, valid_to")
    .order("created_at", { ascending: false });
  if (apartmentParam !== "all") query = query.eq("apartment_id", apartmentParam);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Erreur lors du chargement des codes promo", details: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json(data);
}

// POST: crée un code pour un ou plusieurs appartements
// body: { name, percentage, active, apartments: string[], valid_from, valid_to }
export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().toUpperCase();
  const percentage = Number(body?.percentage);
  const active = body?.active !== false;
  const apartments: string[] = Array.isArray(body?.apartments) ? body.apartments : [];
  const validFrom = body?.valid_from;
  const validTo = body?.valid_to;

  if (!/^[A-Z0-9]{4,20}$/.test(name)) {
    return NextResponse.json(
      { error: "Le code doit contenir 4 à 20 lettres ou chiffres, sans espace." },
      { status: 400 },
    );
  }
  // Nouveaux codes : période de validité obligatoire (première et dernière
  // nuit couvertes). Les anciens codes sans dates restent gérés par mois.
  if (!isIsoDate(validFrom) || !isIsoDate(validTo)) {
    return NextResponse.json(
      { error: "Indiquez la période de validité du code (du … au …)." },
      { status: 400 },
    );
  }
  if (validFrom > validTo) {
    return NextResponse.json(
      { error: "La fin de la période doit être après son début." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) {
    return NextResponse.json(
      { error: "La réduction doit être un nombre entier entre 1 et 100 %." },
      { status: 400 },
    );
  }
  const validSlugs = APARTMENT_LIST.map((a) => a.slug as string);
  if (apartments.length === 0 || apartments.some((a) => !validSlugs.includes(a))) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  // Refuser si le code existe déjà sur l'un des appartements (même casse ignorée)
  const { data: existing, error: existingError } = await supabase
    .from("promo_code")
    .select("apartment_id")
    .ilike("name", name)
    .in("apartment_id", apartments);
  if (existingError) {
    return NextResponse.json(
      { error: "Erreur lors de la vérification du code", details: existingError.message },
      { status: 500 },
    );
  }
  if (existing && existing.length > 0) {
    const names = existing
      .map((e) => getApartmentBySlug(e.apartment_id)?.name ?? e.apartment_id)
      .join(" et ");
    return NextResponse.json(
      { error: `Le code ${name} existe déjà pour ${names}.` },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("promo_code")
    .insert(
      apartments.map((apartment_id) => ({
        name,
        percentage,
        active,
        apartment_id,
        valid_from: validFrom,
        valid_to: validTo,
      })),
    )
    .select("id, created_at, name, percentage, active, apartment_id, valid_from, valid_to");

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du code", details: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
