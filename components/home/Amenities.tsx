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
  "Frigo": <RiFridgeLine />,
  "Plaques": <PiCookingPot />,
  "Machine Nespresso": <PiCoffee />,
  "Lave-vaisselle": <PiForkKnife />,
  "Salle de bain (douche)": <PiShower />,
  "Rangements": <BiCabinet />,
  "Sèche-cheveux": <PiHairDryer />,
  "Balcon": <MdBalcony />,
  "Non-fumeur": <TbSmokingNo />,
};

function getIconForAmenity(label: string): React.ReactNode {
  return iconByLabel[label] ?? <PiCheckCircle />;
}

function Amenitie({ icon, name }: AmenitieProps) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-base-300">
      <span className="text-xl text-cta" aria-hidden="true">
        {icon}
      </span>
      <span className="text-[15px]">{name}</span>
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
      <div className="text-base-content/60">
        Équipements à venir
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-x-6">
      {amenitiesList.map((name, index) => (
        <Amenitie key={index} icon={getIconForAmenity(name)} name={name} />
      ))}
    </div>
  );
}
