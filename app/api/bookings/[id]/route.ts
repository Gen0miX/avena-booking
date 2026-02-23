import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Booking } from "@/lib/bookings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      created_at,
      fname,
      lname,
      mail,
      phone,
      address,
      postal_code,
      birthdate,
      no_adults,
      no_childs,
      arrival_date,
      departure_date,
      price,
      is_cleaning,
      is_paid,
      status (
        id,
        name
      )
    `
    )
    .eq("id", parsedId)
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Booking not found", details: error },
      { status: 404 }
    );
  }

  const typedBooking: Booking | null = {
    ...data,
    arrival_date: new Date(data.arrival_date),
    departure_date: new Date(data.departure_date),
    status: Array.isArray(data.status) ? data.status[0] : data.status,
  };

  return NextResponse.json(typedBooking);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const updates = await request.json();
  const supabase = await createClient();

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
    .eq("id", parsedId);

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = parseInt(id);
  const supabase = await createClient();

  const { error } = await supabase.from("bookings").delete().eq("id", parsedId);

  if (error) {
    return NextResponse.json(
      { error: "Delete error", details: error },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Booking deleted" });
}
