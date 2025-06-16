import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";
import { BookingInput } from "@/lib/bookings";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const updates = await request.json();

  const supabase = createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      ...updates,
      ...(updates.arrival_date && {
        arrival_date: new Date(updates.arrival_date).toISOString(),
      }),
      ...(updates.departure_date && {
        departure_date: new Date(updates.departure_date).toISOString(),
      }),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Update error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Booking updated" });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const supabase = createClient();

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Delete error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Booking deleted" });
}
