import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

// PATCH: activer / désactiver un code — body: { active: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = parseInt((await params).id, 10);
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(id) || typeof body?.active !== "boolean") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("promo_code")
    .update({ active: body.active })
    .eq("id", id)
    .select("id, created_at, name, percentage, active, apartment_id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du code", details: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json(data);
}

// DELETE: supprimer un code
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = parseInt((await params).id, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { error } = await supabase.from("promo_code").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du code", details: error.message },
      { status: 500 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
