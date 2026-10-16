import { MetadataRoute } from "next";
import { APARTMENT_LIST } from "@/config/apartments";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.avena39.ch";
  return [
    { url: base, lastModified: new Date() },
    ...APARTMENT_LIST.map((apartment) => ({
      url: `${base}/appartements/${apartment.slug}`,
      lastModified: new Date(),
    })),
  ];
}
