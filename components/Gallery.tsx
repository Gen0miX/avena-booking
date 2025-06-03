"use client";

import Image from "next/image";
import { useState } from "react";

const images = [
  {
    src: "/images/appartements/salon.webp",
    alt: "Salon",
  },
  {
    src: "/images/appartements/cuisine.webp",
    alt: "Cuisine",
  },
  { src: "/images/appartements/chambre1.webp", alt: "Chambre 1" },
  { src: "/images/appartements/chambre2.webp", alt: "Chambre 2" },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-3 h-[300px] md:grid-cols-[2fr_2fr_1fr_1fr] md:grid-rows-2 gap-2 md:h-[400px] pb-5">
      {/* Grande image à gauche - occupe 2 colonnes et 2 rangées */}
      <div className="relative col-span-2 md:row-span-2 rounded-xl overflow-hidden">
        <Image
          src={images[0].src}
          alt={images[0].alt}
          fill
          className="object-cover cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => setSelectedImage(images[0].src)}
        />
      </div>

      {/* Image top-right 1 */}
      <div className="relative rounded-xl overflow-hidden">
        <Image
          src={images[1].src}
          alt={images[1].alt}
          fill
          className="object-cover cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => setSelectedImage(images[1].src)}
        />
      </div>

      {/* Image top-right 2 */}
      <div className="relative rounded-xl overflow-hidden">
        <Image
          src={images[2].src}
          alt={images[2].alt}
          fill
          className="object-cover cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => setSelectedImage(images[2].src)}
        />
      </div>

      {/* Image bottom-right 3 */}
      <div className="relative rounded-xl overflow-hidden">
        <Image
          src={images[3].src}
          alt={images[3].alt}
          fill
          className="object-cover cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() => setSelectedImage(images[3].src)}
        />
      </div>

      {/* +X photos bouton - avec overlay sur la dernière image */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-primary opacity-30 flex items-center justify-center z-10"></div>
        {/* Image de fond pour le bouton */}
      </div>

      {/* Modal */}
      {selectedImage && (
        <dialog
          className="modal modal-open"
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-box max-w-5xl p-0 bg-transparent shadow-none">
            <Image
              src={selectedImage}
              alt="Agrandie"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
