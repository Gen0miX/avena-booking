"use client";

import PricingPeriodsManager from "./PricingPeriodsManager";
import GeneralSettings from "./GeneralSettings";
import { ApartmentSlug } from "@/config/apartments";

interface SettingsPageProps {
  apartmentSlug: ApartmentSlug;
}

// Une seule page : ouverture des réservations, tarifs saisonniers et
// périodes spéciales, de haut en bas (plus d'onglets).
export default function SettingsPage({ apartmentSlug }: SettingsPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <GeneralSettings apartmentSlug={apartmentSlug} />
      <PricingPeriodsManager apartmentSlug={apartmentSlug} />
    </div>
  );
}
