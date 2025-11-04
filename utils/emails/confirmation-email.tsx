// emails/BookingConfirmationEmail.tsx
import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Heading,
} from "@react-email/components";

type BookingConfirmationEmailProps = {
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
  bookingId: number;
  checkin_time?: string;
  checkout_time?: string;
};

export default function BookingConfirmationEmail({
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
  bookingId,
  checkin_time = "16:00",
  checkout_time = "11:00",
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Work+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Logo centré */}
          <Section style={{ textAlign: "center", marginBottom: "20px" }}>
            <a href="https://www.avena39.ch" target="_blank" rel="noreferrer">
              <Img
                src="https://www.avena39.ch/logos/logo_Avena_L.svg"
                width="135"
                alt="Avena39"
                style={{ margin: "0 auto" }}
              />
            </a>
          </Section>

          {/* Heading */}
          <Section style={{ textAlign: "center", marginBottom: "20px" }}>
            <Heading style={h1}>Réservation confirmée 🎉</Heading>
          </Section>

          {/* Contenu texte */}
          <Section>
            <Text style={text}>
              Bonjour {fname} {lname},
            </Text>
            <Text style={text}>
              Nous avons le plaisir de confirmer votre réservation{" "}
              <b>#{bookingId}</b> du{" "}
              {new Date(arrival_date).toLocaleDateString("fr-FR")} au{" "}
              {new Date(departure_date).toLocaleDateString("fr-FR")}.
            </Text>
            <Text style={text}>
              Montant total réglé : <b>{price} CHF</b>
            </Text>

            <Text style={subheading}>📌 Informations pratiques</Text>
            <Text style={text}>
              ✅ Arrivée autonome via boîte à clés <br />⏰ Check-in :{" "}
              <b>{checkin_time}</b> <br />⏰ Check-out : <b>{checkout_time}</b>
            </Text>

            <Text style={subheading}>📋 Avant votre départ</Text>
            <Text style={text}>
              • Jeter les ordures (poubelle + déchetterie) <br />
              • Retirer les draps des lits utilisés <br />
              • Remettre les clés dans la boîte à clés <br />• Vérifier que
              toutes les portes soient bien verrouillées
            </Text>

            <Text style={text}>
              Vous pouvez consulter nos{" "}
              <a
                href="https://www.avena39.ch/conditions-generales"
                target="_blank"
                rel="noreferrer"
              >
                conditions d’annulation
              </a>
              .
            </Text>

            <Text style={text}>Nous vous souhaitons un agréable séjour 🌿</Text>

            <Text style={text}>
              Pour toute question, contactez-nous :
              <br />
              📧 <a href="mailto:info@avena39.ch">info@avena39.ch</a>
              <br />
              📞 +41 76 370 86 77
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f9",
  fontFamily: "'Work Sans', Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "16px",
  backgroundColor: "#e3e8eb",
  borderRadius: "8px",
  border: "2px solid #b4c4c2",
  maxWidth: "600px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  fontFamily: "'Playfair Display', serif",
};

const subheading = {
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "16px",
  marginBottom: "8px",
  color: "#111",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#333333",
};
