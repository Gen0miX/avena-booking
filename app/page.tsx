"use client";

import Hero from "@/components/Hero";
import Disponibility from "@/components/Disponibility";
import Gallery from "@/components/Gallery";

export default function Home() {
  const images = [
    { src: "/images/appartements/salon_.webp", alt: "Image salon" },
    { src: "/images/appartements/cuisine_.webp", alt: "Image cuisine" },
    {
      src: "/images/appartements/chambre1_.webp",
      alt: "Image chambre 1",
    },
    {
      src: "/images/appartements/chambre2_.webp",
      alt: "Image chambre 2",
    },
  ];

  return (
    <>
      <Hero></Hero>
      <Gallery></Gallery>
      <Disponibility></Disponibility>
    </>
  );
}
