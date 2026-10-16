import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { BookingInput, Booking } from "@/lib/bookings";
import { sendBookingEmail } from "@/lib/email";
import { sendTelegramNotification } from "@/utils/telegram";
import { DEFAULT_BOOKING_BLOCKED_AFTER } from "@/lib/settings";
import { getApartmentBySlug } from "@/config/apartments";
import { getPriceResult, getNights } from "@/utils/priceCalculator";
import { PricingPeriod } from "@/lib/pricingPeriods";
import { isPromoApplicable } from "@/lib/promo";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apartmentParam = request.nextUrl.searchParams.get("apartment");
  if (apartmentParam && apartmentParam !== "all" && !getApartmentBySlug(apartmentParam)) {
    return NextResponse.json({ error: "Appartement inconnu" }, { status: 400 });
  }

  let query = supabase
    .from("bookings")
    .select(
      `
      id,
      apartment_id,
      created_at,
      fname,
      lname,
      mail,
      phone,
      address,
      postal_code,
      city,
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
    .order("arrival_date", { ascending: true });

  if (apartmentParam && apartmentParam !== "all") {
    query = query.eq("apartment_id", apartmentParam);
  }

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error },
      { status: 500 }
    );
  }

  const typedData: Booking[] = data.map((item) => ({
    ...item,
    arrival_date: new Date(item.arrival_date),
    departure_date: new Date(item.departure_date),
    status: Array.isArray(item.status) ? item.status[0] : item.status,
  }));

  return NextResponse.json(typedData);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...bookingData }: { token: string } & BookingInput = body;

    // Fonction helper pour s'assurer d'avoir le bon format date
    const ensureDateString = (dateInput: string | Date): string => {
      if (typeof dateInput === "string") {
        // Si c'est déjà une string, vérifier le format
        if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateInput; // Déjà au bon format YYYY-MM-DD
        }
      }

      // Si c'est un objet Date ou une string mal formatée
      const date = new Date(dateInput);
      // Utiliser getFullYear, getMonth, getDate pour éviter les problèmes de timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Convertir les dates proprement
    const arrivalDate = ensureDateString(bookingData.arrival_date);
    const departureDate = ensureDateString(bookingData.departure_date);

    // reCAPTCHA
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${encodeURIComponent(token)}`,
        signal: AbortSignal.timeout(5000),
      }
    );

    const captchaData = await recaptchaResponse.json();
    if (!captchaData.success || captchaData.score < 0.5) {
      return NextResponse.json(
        { message: "Captcha verification failed" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const apartment = getApartmentBySlug(bookingData.apartment_id);
    if (!apartment) {
      return NextResponse.json(
        { message: "Appartement inconnu" },
        { status: 400 }
      );
    }

    // Vérifier la date limite des réservations (par appartement)
    const { data: settingsData } = await supabase
      .from("settings")
      .select("booking_blocked_after")
      .eq("apartment_id", apartment.slug)
      .maybeSingle();

    const blockedAfter =
      settingsData?.booking_blocked_after || DEFAULT_BOOKING_BLOCKED_AFTER;

    if (blockedAfter) {
      const limitDate = new Date(blockedAfter);
      limitDate.setHours(23, 59, 59, 999);
      const arrivalDateObj = new Date(arrivalDate);

      if (arrivalDateObj > limitDate) {
        return NextResponse.json(
          {
            message: `Les réservations sont limitées jusqu'au ${new Date(blockedAfter).toLocaleDateString("fr-CH")}`,
          },
          { status: 400 }
        );
      }
    }

    // Règles de capacité / minimum de nuits, côté serveur (jusqu'ici non vérifiées)
    const arrivalDateObj2 = new Date(arrivalDate + "T00:00:00");
    const departureDateObj2 = new Date(departureDate + "T00:00:00");
    const nights = getNights(arrivalDateObj2, departureDateObj2);

    if (bookingData.no_adults > apartment.capacity) {
      return NextResponse.json(
        { message: `Le nombre maximum d'adultes est ${apartment.capacity}.` },
        { status: 400 }
      );
    }
    const totalTravelers = bookingData.no_adults + (bookingData.no_childs ?? 0);
    if (totalTravelers > apartment.capacity) {
      return NextResponse.json(
        { message: `Le nombre maximum de voyageurs est ${apartment.capacity}.` },
        { status: 400 }
      );
    }
    if (nights < apartment.minNights) {
      return NextResponse.json(
        { message: `Le minimum de séjour est de ${apartment.minNights} nuits.` },
        { status: 400 }
      );
    }

    // Disponibilité : aucune réservation active ne doit chevaucher ces dates,
    // et seulement pour ce même appartement (une résa sur avena-2 ne doit
    // jamais bloquer avena-1 et vice-versa).
    const { data: overlapping, error: overlapError } = await supabase
      .from("bookings")
      .select("id")
      .eq("apartment_id", apartment.slug)
      .neq("status", 4)
      .lt("arrival_date", departureDate)
      .gt("departure_date", arrivalDate);

    if (overlapError) {
      return NextResponse.json(
        { message: "Erreur lors de la vérification de disponibilité" },
        { status: 500 }
      );
    }
    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        { message: "Ces dates ne sont plus disponibles pour cet appartement" },
        { status: 409 }
      );
    }

    // Prix : recalculé côté serveur à partir des règles de l'appartement,
    // puis (si un code promo est fourni) re-vérifié et réduit de la même
    // façon que côté client, pour ne jamais faire confiance au prix envoyé.
    const { data: customPeriods } = await supabase
      .from("pricing_periods")
      .select("*")
      .eq("apartment_id", apartment.slug);

    const { price: basePrice, error: priceError } = getPriceResult({
      start: arrivalDateObj2,
      end: departureDateObj2,
      adults: bookingData.no_adults,
      customPeriods: (customPeriods ?? []) as PricingPeriod[],
      apartment,
    });

    if (priceError || basePrice === null) {
      return NextResponse.json({ message: priceError ?? "Prix invalide" }, { status: 400 });
    }

    let expectedPrice = basePrice;
    const promoCodeInput = (bookingData as unknown as { promo_code?: string }).promo_code;
    if (promoCodeInput) {
      const normalized = promoCodeInput.trim().toUpperCase();
      const { data: promo } = await supabase
        .from("promo_code")
        .select("percentage, active")
        .eq("apartment_id", apartment.slug)
        .ilike("name", normalized)
        .maybeSingle();

      if (
        promo?.active &&
        isPromoApplicable(normalized, arrivalDate, departureDate)
      ) {
        expectedPrice = Math.max(0, Math.round(basePrice * (1 - Number(promo.percentage) / 100)));
      }
    }

    if (Math.round(bookingData.price) !== expectedPrice) {
      return NextResponse.json(
        { message: "Le prix de la réservation ne correspond pas au tarif attendu" },
        { status: 400 }
      );
    }

    const { promo_code: _promoCode, ...bookingDataForInsert } = bookingData as BookingInput & {
      promo_code?: string;
    };

    // Insertion directe avec les strings formatés.
    // Le prix inséré est TOUJOURS celui calculé côté serveur (expectedPrice),
    // jamais la valeur brute envoyée par le client : celle-ci n'a été utilisée
    // que pour la vérification ci-dessus, et un client pourrait sinon envoyer
    // un prix "arrondi correctement" (ex. 122.51 au lieu de 123) qui passerait
    // le contrôle Math.round() tout en étant légèrement différent du prix réel.
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert([
        {
          apartment_id: bookingDataForInsert.apartment_id,
          fname: bookingDataForInsert.fname,
          lname: bookingDataForInsert.lname,
          mail: bookingDataForInsert.mail,
          phone: bookingDataForInsert.phone,
          address: bookingDataForInsert.address,
          postal_code: bookingDataForInsert.postal_code,
          city: bookingDataForInsert.city,
          birthdate: bookingDataForInsert.birthdate,
          no_adults: bookingDataForInsert.no_adults,
          no_childs: bookingDataForInsert.no_childs,
          is_cleaning: bookingDataForInsert.is_cleaning,
          arrival_date: arrivalDate,
          departure_date: departureDate,
          price: expectedPrice,
          status: 1,
          is_paid: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Insert error", details: error },
        { status: 500 }
      );
    }

    try {
      console.log("📧 Envoi email...");
      await sendBookingEmail({
        to: booking.mail,
        fname: booking.fname,
        lname: booking.lname,
        arrival_date: booking.arrival_date,
        departure_date: booking.departure_date,
        price: booking.price,
        bookingId: booking.id,
        apartmentName: apartment.name,
      });
      console.log("✅ Email envoyé");
    } catch (emailError) {
      console.error("❌ Erreur d'envoi de l'email:", emailError);
    }

    try {
      console.log("📱 Envoi notification Telegram...");
      await sendTelegramNotification("booking", {
        name: `${booking.fname} ${booking.lname}`,
        arrival: booking.arrival_date,
        departure: booking.departure_date,
        apartmentName: apartment.name,
      });
      console.log("✅ Notification Telegram envoyée");
    } catch (tgError) {
      console.error("❌ Erreur d'envoi Telegram:", tgError);
    }

    // Retourner directement l'objet booking
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Erreur dans POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
