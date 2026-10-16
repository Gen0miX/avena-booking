import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApartmentBySlug, APARTMENT_LIST } from "@/config/apartments";
import ApartmentPageClient from "./ApartmentPageClient";

export function generateStaticParams() {
  return APARTMENT_LIST.map((apartment) => ({ slug: apartment.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);
  if (!apartment) return {};
  return {
    title: `${apartment.name} — Avena`,
    description: apartment.description.intro,
  };
}

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);
  if (!apartment) notFound();

  return <ApartmentPageClient apartment={apartment} />;
}
