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
    // ✅ Timeout sur l'envoi d'email, correctement nettoyé
    const emailPromise = resend.emails.send({
      from: "noreply@jonas-pilloud.ch",
      to,
      subject: "Confirmation de votre réservation",
      html: `
        <h1>Bonjour ${fname} ${lname},</h1>
        <p>Merci pour votre réservation du ${new Date(arrival_date).toLocaleDateString("fr-FR")} au ${new Date(departure_date).toLocaleDateString("fr-FR")}.</p>
        <p>Montant total : ${price} CHF</p>
        <p>Nous reviendrons vers vous prochainement pour confirmer la disponibilité.</p>
        <p>À bientôt !</p>
      `,
    });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let didTimeout = false;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        didTimeout = true;
        reject(new Error("Email timeout"));
      }, 15000);
    });

    const result = (await Promise.race([
      emailPromise,
      timeoutPromise,
    ])) as Awaited<typeof emailPromise>;

    if (timeoutId) clearTimeout(timeoutId);

    if (didTimeout) {
      // Évite un rejet non géré si l'email rejette après le timeout
      void emailPromise.catch(() => {});
    }

    if (result.error) throw result.error;

    console.log("Email envoyé avec succès:", result.data?.id);
    return result.data;
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email:", err);
    throw err;
  }
}
