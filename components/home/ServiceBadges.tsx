import {
  MdOutlineMeetingRoom,
  MdOutlinePeople,
  MdOutlineBathtub,
} from "react-icons/md";
import { IoPawOutline } from "react-icons/io5";
import { ApartmentConfig } from "@/config/apartments";

interface ServiceBadgeProps {
  type: "bedroom" | "people" | "bathroom" | "pets";
  text: string;
}

function ServiceBadge({ type, text }: ServiceBadgeProps) {
  const icons = {
    bedroom: <MdOutlineMeetingRoom className="text-4xl" />,
    people: <MdOutlinePeople className="text-4xl" />,
    bathroom: <MdOutlineBathtub className="text-4xl" />,
    pets: <IoPawOutline className="text-4xl" />,
  };

  return (
    <div className="flex flex-col items-center justify-between border-2 border-primary/40 rounded-box p-2 sm:p-4 h-full">
      <div className="h-10 flex items-center justify-center">{icons[type]}</div>
      <p className="text-center font-medium text-xs sm:text-sm h-12 flex items-center justify-center">
        {text}
      </p>
    </div>
  );
}

export default function ServiceBadges({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const texts = {
    bedroom:
      apartment.bedrooms !== null
        ? `${apartment.bedrooms} chambre${apartment.bedrooms > 1 ? "s" : ""}`
        : "À venir",
    people: `${apartment.capacity} personnes`,
    bathroom:
      apartment.bathrooms !== null
        ? `${apartment.bathrooms} salle${apartment.bathrooms > 1 ? "s" : ""} de bain`
        : "À venir",
    pets: apartment.petsAllowed ? "animaux acceptés" : "pas d'animaux",
  };

  return (
    <div className="grid grid-cols-4 grid-rows-1 gap-2 sm:gap-6 max-w-2xl h-28 items-stretch mb-10">
      <ServiceBadge type="bedroom" text={texts.bedroom}></ServiceBadge>
      <ServiceBadge type="people" text={texts.people}></ServiceBadge>
      <ServiceBadge type="bathroom" text={texts.bathroom}></ServiceBadge>
      <ServiceBadge type="pets" text={texts.pets}></ServiceBadge>
    </div>
  );
}
