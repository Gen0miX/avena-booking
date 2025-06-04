import {
  MdOutlineMeetingRoom,
  MdOutlinePeople,
  MdOutlineBathtub,
} from "react-icons/md";
import { IoPawOutline } from "react-icons/io5";

interface ServiceBadgeProps {
  type: "bedroom" | "people" | "bathroom" | "pets";
}

function ServiceBadge({ type }: ServiceBadgeProps) {
  const icons = {
    bedroom: <MdOutlineMeetingRoom className="text-4xl" />,
    people: <MdOutlinePeople className="text-4xl" />,
    bathroom: <MdOutlineBathtub className="text-4xl" />,
    pets: <IoPawOutline className="text-4xl" />,
  };

  const texts = {
    bedroom: "3 chambres",
    people: "5 personnes",
    bathroom: "1 salle de bain",
    pets: "pas d'animaux",
  };

  return (
    <div className="flex flex-col items-center justify-between border-2 border-primary/40 rounded-box p-2 sm:p-4 h-full">
      <div className="h-10 flex items-center justify-center">{icons[type]}</div>
      <p className="text-center font-medium text-xs sm:text-sm h-12 flex items-center justify-center">
        {texts[type]}
      </p>
    </div>
  );
}

export default function ServiceBadges() {
  return (
    <div className="grid grid-cols-4 grid-rows-1 gap-2 sm:gap-6 max-w-2xl h-28 items-stretch mb-10">
      <ServiceBadge type="bedroom"></ServiceBadge>
      <ServiceBadge type="people"></ServiceBadge>
      <ServiceBadge type="bathroom"></ServiceBadge>
      <ServiceBadge type="pets"></ServiceBadge>
    </div>
  );
}
