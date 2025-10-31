import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

type ValidateRequestBody = {
  code: string;
  arrival_date: string; // YYYY-MM-DD
  departure_date: string; // YYYY-MM-DD
};

function parseMonthFromCode(code: string): number | null {
  // Retourne l'index du mois (0-11) ou null si invalide
  if (!code || code.length < 3) return null;
  const prefix = code.slice(0, 3).toUpperCase();
  // Support EN et FR abréviations courantes
  const monthMap: Record<string, number> = {
    JAN: 0,
    FEV: 1, // français
    FEB: 1, // anglais
    MAR: 2,
    AVR: 3, // français
    APR: 3, // anglais
    MAI: 4, // français
    MAY: 4, // anglais
    JUN: 5,
    JUI: 6, // français (juil)
    JUL: 6, // anglais
    AOU: 7, // français (août)
    AUG: 7, // anglais
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
    DECEMBRE: 11, // tolérance si codes différents (non requis)
  };
  // Gestion de cas FR "JUIL", "AOUT" en 3 lettres déjà mappées JUI/AOU
  return monthMap[prefix] ?? null;
}

function toDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequestBody;
    const code = (body.code || "").trim();
    const normalized = code.toUpperCase();
    const { arrival_date, departure_date } = body;

    if (!code || !arrival_date || !departure_date) {
      return NextResponse.json(
        { active: false, reason: "Requête invalide" },
        { status: 400 }
      );
    }

    const targetMonthIdx = parseMonthFromCode(normalized);
    if (targetMonthIdx === null) {
      return NextResponse.json(
        { active: false, reason: "Code promo invalide (mois non reconnu)" },
        { status: 200 }
      );
    }

    const start = toDateOnly(arrival_date);
    const end = toDateOnly(departure_date);

    // Vérifier que la réservation est entièrement dans le mois ciblé
    if (
      start.getMonth() !== targetMonthIdx ||
      end.getMonth() !== targetMonthIdx
    ) {
      return NextResponse.json(
        {
          active: false,
          reason: "Code non applicable aux dates sélectionnées",
        },
        { status: 200 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("promo_code")
      .select("id, name, percentage, active")
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
