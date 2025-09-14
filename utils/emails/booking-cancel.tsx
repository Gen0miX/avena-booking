// emails/BookingCancellationEmail.tsx
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

type BookingCancellationEmailProps = {
  fname: string;
  lname: string;
  bookingId: number;
  arrival_date: string;
  departure_date: string;
};

export default function BookingCancellationEmail({
  fname,
  lname,
  bookingId,
  arrival_date,
  departure_date,
}: BookingCancellationEmailProps) {
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
            <Heading style={h1}>Annulation de votre réservation</Heading>
          </Section>

          {/* Contenu texte */}
          <Section>
            <Text style={text}>
              Bonjour {fname} {lname},
            </Text>

            <Text style={text}>
              Nous vous confirmons que votre réservation <b>#{bookingId}</b> du{" "}
              {new Date(arrival_date).toLocaleDateString("fr-FR")} au{" "}
              {new Date(departure_date).toLocaleDateString("fr-FR")} a bien été{" "}
              <b>annulée</b>.
            </Text>

            <Text style={text}>
              Si un paiement a déjà été effectué, le remboursement sera effectué
              dans les prochains jours, conformément à nos conditions
              d’annulation.
            </Text>

            <Text style={text}>
              Vous pouvez consulter le détail de nos{" "}
              <a
                href="https://www.avena39.ch/conditions-annulation"
                target="_blank"
                rel="noreferrer"
              >
                conditions d’annulation
              </a>
              .
            </Text>

            <Text style={text}>
              Pour toute question, contactez-nous :
              <br />
              📧 <a href="mailto:info@avena39.ch">info@avena39.ch</a>
              <br />
              📞 +41 76 370 86 77
            </Text>

            <Text style={{ ...text, marginTop: "16px" }}>
              Nous espérons avoir le plaisir de vous accueillir une prochaine
              fois 🌿
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
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center" as const,
  fontFamily: "'Playfair Display', serif",
};

const text = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#333333",
};
