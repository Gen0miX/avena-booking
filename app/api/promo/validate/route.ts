import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getApartmentBySlug } from "@/config/apartments";
import { isPromoApplicable } from "@/lib/promo";

type ValidateRequestBody = {
  code: string;
  apartment_id: string;
  arrival_date: string; // YYYY-MM-DD
  departure_date: string; // YYYY-MM-DD
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequestBody;
    const code = (body.code || "").trim();
    const normalized = code.toUpperCase();
    const { arrival_date, departure_date, apartment_id } = body;

    if (!code || !arrival_date || !departure_date || !apartment_id) {
      return NextResponse.json(
        { active: false, reason: "Requête invalide" },
        { status: 400 }
      );
    }
    if (!getApartmentBySlug(apartment_id)) {
      return NextResponse.json(
        { active: false, reason: "Appartement inconnu" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promo_code")
      .select("id, name, percentage, active, valid_from, valid_to")
      .eq("apartment_id", apartment_id)
      .ilike("name", normalized)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { active: false, reason: "Erreur serveur", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { active: false, reason: "Code introuvable" },
        { status: 200 }
      );
    }

    if (!data.active) {
      return NextResponse.json(
        { active: false, reason: "Code non valide" },
        { status: 200 }
      );
    }

    // Séjour entièrement couvert par la période du code (ou par son mois
    // pour les anciens codes)
    if (!isPromoApplicable(data, arrival_date, departure_date)) {
      return NextResponse.json(
        { active: false, reason: "Code non applicable aux dates sélectionnées" },
        { status: 200 }
      );
    }

    // OK
    return NextResponse.json(
      {
        active: true,
        percentage: data.percentage,
        reason: null,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { active: false, reason: "Erreur serveur" },
      { status: 500 }
    );
  }
}
