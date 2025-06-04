import {
  PiWifiHigh,
  PiTelevisionSimple,
  PiOven,
  PiCookingPot,
  PiShower,
  PiCoffee,
  PiForkKnife,
} from "react-icons/pi";
import { RiFridgeLine } from "react-icons/ri";
import { MdBalcony } from "react-icons/md";
import { BiCabinet } from "react-icons/bi";
import { TbSmokingNo } from "react-icons/tb";

interface AmenitieProps {
  icon: React.ReactNode;
  name: string;
}

function Amenitie({ icon, name }: AmenitieProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-base-content/70">{name}</span>
    </div>
  );
}

export default function Amenities() {
  const amenitiesList = [
    { icon: <PiWifiHigh />, name: "Wi-Fi" },
    { icon: <PiTelevisionSimple />, name: "Télévision" },
    { icon: <PiOven />, name: "Four" },
    { icon: <RiFridgeLine className="text-base-content/80" />, name: "Frigo" },
    { icon: <PiCookingPot />, name: "Plaques" },
    { icon: <PiCoffee />, name: "Machine à café" },
    { icon: <PiForkKnife />, name: "Lave-vaisselle" },
    { icon: <PiShower />, name: "Salle de bain (douche)" },
    {
      icon: <BiCabinet className="text-base-content/80" />,
      name: "Rangements",
    },
    { icon: <MdBalcony className="text-base-content/80" />, name: "Balcon" },
    {
      icon: <TbSmokingNo className="text-base-content/80" />,
      name: "Non-fumeur",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-10 max-w-xl">
      {amenitiesList.map((item, index) => (
        <Amenitie key={index} icon={item.icon} name={item.name} />
      ))}
    </div>
  );
}
