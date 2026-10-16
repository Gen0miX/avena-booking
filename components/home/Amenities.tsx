import { PiCheckCircle, PiWifiHigh, PiTelevisionSimple, PiOven, PiCookingPot, PiCoffee, PiForkKnife, PiShower, PiHairDryer } from "react-icons/pi";
import { RiFridgeLine } from "react-icons/ri";
import { MdBalcony } from "react-icons/md";
import { TbSmokingNo } from "react-icons/tb";
import { BiCabinet } from "react-icons/bi";
import { ApartmentConfig } from "@/config/apartments";

interface AmenitieProps {
  icon: React.ReactNode;
  name: string;
}

// Keyed by the exact amenity label strings from config/apartments.ts
// (AVENA_1.amenities). Any label not listed here (e.g. avena-2's
// placeholder/future list) falls back to the generic PiCheckCircle.
const iconByLabel: Record<string, React.ReactNode> = {
  "Wi-Fi": <PiWifiHigh />,
  "Écran": <PiTelevisionSimple />,
  "Four": <PiOven />,
  "Frigo": <RiFridgeLine className="text-base-content/80" />,
  "Plaques": <PiCookingPot />,
  "Machine Nespresso": <PiCoffee />,
  "Lave-vaisselle": <PiForkKnife />,
  "Salle de bain (douche)": <PiShower />,
  "Rangements": <BiCabinet className="text-base-content/80" />,
  "Sèche-cheveux": <PiHairDryer />,
  "Balcon": <MdBalcony className="text-base-content/80" />,
  "Non-fumeur": <TbSmokingNo className="text-base-content/80" />,
};

function getIconForAmenity(label: string): React.ReactNode {
  return iconByLabel[label] ?? <PiCheckCircle />;
}

function Amenitie({ icon, name }: AmenitieProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-base-content/70">{name}</span>
    </div>
  );
}

export default function Amenities({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const amenitiesList = apartment.amenities;

  if (amenitiesList.length === 0) {
    return (
      <div className="mb-10 max-w-xl text-base-content/60">
        Équipements à venir
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-10 max-w-xl">
      {amenitiesList.map((name, index) => (
        <Amenitie key={index} icon={getIconForAmenity(name)} name={name} />
      ))}
    </div>
  );
}
