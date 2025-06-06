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
  // Initialisation directe dans useState au lieu d'useEffect
  const [imageLoading, setImageLoading] = useState<string[]>(
    images.map((img) => img.src)
  );
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const handleImageLoad = (src: string) => {
    setImageLoading((prev) => prev.filter((s) => s !== src));
  };

  const handleClickImage = (src: string) => {
    setSelectedImage(src);
    setModalLoading(true);

    // Forcer le rechargement si l'image est en cache
    const img = new window.Image();
    img.onload = () => setModalLoading(false);
    img.onerror = () => setModalLoading(false);
    img.src = src;
  };

  // useEffect supprimé - plus besoin !

  return (
    <>
      <div className="grid grid-cols-3 h-[300px] md:grid-cols-[2fr_2fr_1fr_1fr] md:grid-rows-2 gap-2 md:h-[400px] pb-5">
        {images.map((img, idx) => (
          <div
            key={img.src}
            className={`relative rounded-xl shadow-md overflow-hidden ${
              idx === 0 ? "col-span-2 md:row-span-2" : ""
            }`}
          >
            {imageLoading.includes(img.src) && (
              <div className="skeleton w-full h-full absolute inset-0 z-10" />
            )}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={() => handleClickImage(img.src)}
              onLoad={() => handleImageLoad(img.src)}
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <dialog
          className="modal modal-open"
          onClick={() => {
            setSelectedImage(null);
            setModalLoading(false);
          }}
        >
          <div className="modal-box max-w-5xl p-0 bg-transparent shadow-none">
            {modalLoading && (
              <div className="flex justify-center items-center w-full h-[400px]">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            )}
            <Image
              src={selectedImage}
              alt="Agrandie"
              width={1200}
              height={800}
              className={`w-full h-auto rounded-lg ${
                modalLoading ? "hidden" : "block"
              }`}
              priority // Priorité de chargement pour le modal
            />
          </div>
        </dialog>
      )}
    </>
  );
}
