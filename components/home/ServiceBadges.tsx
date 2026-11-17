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
    bedroom: <MdOutlineMeetingRoom size={26} />,
    people: <MdOutlinePeople size={26} />,
    bathroom: <MdOutlineBathtub size={26} />,
    pets: <IoPawOutline size={26} />,
  };

  return (
    <div className="flex flex-col gap-2.5 bg-surface rounded-2xl p-4 sm:p-5">
      <span className="text-cta" aria-hidden="true">
        {icons[type]}
      </span>
      <p className="font-semibold text-sm sm:text-[15px]">{text}</p>
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
    people: `Jusqu'à ${apartment.capacity} voyageurs`,
    bathroom:
      apartment.bathrooms !== null
        ? `${apartment.bathrooms} salle${apartment.bathrooms > 1 ? "s" : ""} de bain`
        : "Salle de bain à venir",
    pets: apartment.petsAllowed ? "Animaux acceptés" : "Animaux non admis",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <ServiceBadge type="people" text={texts.people}></ServiceBadge>
      <ServiceBadge type="bedroom" text={texts.bedroom}></ServiceBadge>
      <ServiceBadge type="bathroom" text={texts.bathroom}></ServiceBadge>
      <ServiceBadge type="pets" text={texts.pets}></ServiceBadge>
    </div>
  );
}
