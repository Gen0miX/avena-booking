import { Resend } from "resend";
import { render } from "@react-email/render";
import BookingEmail from "@/utils/emails/booking-email";
import ConfirmationEmail from "@/utils/emails/confirmation-email";
import BookingCancel from "@/utils/emails/booking-cancel";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail({
  to,
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
}) {
  try {
    const emailHtml = await render(
      BookingEmail({
        fname,
        lname,
        arrival_date,
        departure_date,
        price,
      })
    );

    const result = await resend.emails.send({
      from: "noreply@avena39.ch",
      to,
      subject: "Votre réservation",
      html: emailHtml,
    });

    if (result.error) throw result.error;

    console.log("Email envoyé avec succès:", result.data?.id);
    return result.data;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    throw err;
  }
}

export async function sendBookingConfirmationEmail({
  to,
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
}) {
  try {
    const emailHtml = await render(
      ConfirmationEmail({
        fname,
        lname,
        arrival_date,
        departure_date,
        price,
      })
    );
    const result = await resend.emails.send({
      from: "noreply@avena39.ch",
      to,
      subject: "Confirmation de votre réservation",
      html: emailHtml,
    });

    if (result.error) throw result.error;

    console.log("Email envoyé avec succès:", result.data?.id);
    return result.data;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    throw err;
  }
}

export async function sendBookingCancellationEmail({
  to,
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
}) {
  try {
    const emailHtml = await render(
      BookingCancel({
        fname,
        lname,
        arrival_date,
        departure_date,
        price,
      })
    );
    const result = await resend.emails.send({
      from: "noreply@avena39.ch",
      to,
      subject: "Annulation de votre réservation",
      html: emailHtml,
    });

    if (result.error) throw result.error;

    console.log("Email envoyé avec succès:", result.data?.id);
    return result.data;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    throw err;
  }
}
