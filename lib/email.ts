import { Resend } from "resend";
import { render } from "@react-email/render";
import BookingEmail from "@/utils/emails/booking-email";
import ConfirmationEmail from "@/utils/emails/confirmation-email";
import BookingCancel from "@/utils/emails/booking-cancel";
import { createBookingQRBill } from "@/utils/qrInvoice";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail({
  to,
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
  bookingId,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
  bookingId: number;
}) {
  try {
    const emailHtml = await render(
      BookingEmail({
        fname,
        lname,
        arrival_date,
        departure_date,
        price,
        bookingId,
      })
    );

    let qrBillPdf: Buffer | null = null;
    let emailSubject = "Votre réservation";

    // Essayer de générer la QR-Facture
    try {
      qrBillPdf = await createBookingQRBill({
        fname,
        lname,
        price,
        bookingId,
      });
      emailSubject = "Votre réservation";
      console.log(
        "QR-Facture générée avec succès pour la réservation #",
        bookingId
      );
    } catch (qrError) {
      console.warn(
        "Impossible de générer la QR-Facture pour la réservation #",
        bookingId,
        ":",
        qrError
      );
      // Continuer sans la QR-Facture si la génération échoue
    }

    const emailOptions: any = {
      from: "noreply@avena39.ch",
      to,
      subject: emailSubject,
      html: emailHtml,
    };

    // Ajouter la pièce jointe seulement si la QR-Facture a été générée
    if (qrBillPdf) {
      emailOptions.attachments = [
        {
          filename: `qr-facture-reservation-${bookingId}.pdf`,
          content: qrBillPdf,
          type: "application/pdf",
        },
      ];
    }

    const result = await resend.emails.send(emailOptions);

    if (result.error) throw result.error;

    const status = qrBillPdf ? "avec QR-Facture" : "sans QR-Facture";
    console.log(`Email ${status} envoyé avec succès:`, result.data?.id);
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
  bookingId,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
  bookingId: number;
}) {
  try {
    const emailHtml = await render(
      ConfirmationEmail({
        fname,
        lname,
        arrival_date,
        departure_date,
        price,
        bookingId,
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
  bookingId,
}: {
  to: string;
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  bookingId: number;
}) {
  try {
    const emailHtml = await render(
      BookingCancel({
        fname,
        lname,
        bookingId,
        arrival_date,
        departure_date,
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
