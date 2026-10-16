import { PiCheckCircle } from "react-icons/pi";
import { ApartmentConfig } from "@/config/apartments";

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
        <Amenitie key={index} icon={<PiCheckCircle />} name={name} />
      ))}
    </div>
  );
}
