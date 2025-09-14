// emails/BookingEmail.tsx
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

type BookingEmailProps = {
  fname: string;
  lname: string;
  arrival_date: string;
  departure_date: string;
  price: number;
};

export default function BookingEmail({
  fname,
  lname,
  arrival_date,
  departure_date,
  price,
}: BookingEmailProps) {
  return (
    <Html>
      <Head>
        {/* Import Google Fonts */}
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

          {/* Heading centré */}
          <Section style={{ textAlign: "center", marginBottom: "20px" }}>
            <Heading style={h1}>
              Bonjour {fname} {lname},
            </Heading>
          </Section>

          {/* Contenu texte */}
          <Section>
            <Text style={text}>
              Merci pour votre réservation du{" "}
              {new Date(arrival_date).toLocaleDateString("fr-FR")} au{" "}
              {new Date(departure_date).toLocaleDateString("fr-FR")}.
            </Text>
            <Text style={text}>
              Montant total : <b>{price} CHF</b>
            </Text>
            <Text style={text}>
              Nous reviendrons vers vous prochainement pour confirmer la
              disponibilité.
            </Text>
            <Text style={text}>À bientôt !</Text>
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
  textAlign: "center" as const, // sécurité pour TS
  fontFamily: "'Playfair Display', serif",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#333333",
};
