import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

export default function BookingConfirmation({
  firstName,
  lastName,
  arrivalDate,
  departureDate,
  price,
}: {
  firstName: string;
  lastName: string;
  arrivalDate: string;
  departureDate: string;
  price: number;
}) {
  return (
    <Html>
      <Head />
    </Html>
  );
}
