import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: "noreply@jonas-pilloud.ch",
      to,
      subject: "Confirmation de votre réservation",
      html: `
        <h1>Bonjour ${fname} ${lname},</h1>
        <p>Merci pour votre réservation du ${arrival_date} au ${departure_date}.</p>
        <p>Montant total : ${price} CHF</p>
        <p>Nous reviendrons vers vous prochainement pour confirmer la disponibilité.</p>
        <p>À bientôt !</p>
      `,
    });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Erreur lors de l’envoi de l’email", err);
    throw err;
  }
}
