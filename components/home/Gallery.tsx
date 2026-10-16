"use client";
import Image from "next/image";
import { useState } from "react";
import { IoGridOutline, IoImageOutline } from "react-icons/io5";
import { ApartmentConfig } from "@/config/apartments";

export default function Gallery({
  apartment,
}: {
  apartment: ApartmentConfig;
}) {
  const images = apartment.gallery;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState<string[]>(
    images.map((img) => img.src),
  );
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const handleImageLoad = (src: string) => {
    setImageLoading((prev) => prev.filter((s) => s !== src));
  };

  const handleClickImage = (index: number) => {
    setSelectedIndex(index);
    setModalLoading(true);

    const img = new window.Image();
    img.onload = () => setModalLoading(false);
    img.onerror = () => setModalLoading(false);
    img.src = images[index].src;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setModalLoading(true);
    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedIndex(prevIndex);
    const img = new window.Image();
    img.onload = () => setModalLoading(false);
    img.src = images[prevIndex].src;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setModalLoading(true);
    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedIndex(nextIndex);
    const img = new window.Image();
    img.onload = () => setModalLoading(false);
    img.src = images[nextIndex].src;
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center h-[260px] md:h-[400px] rounded-2xl bg-base-300 text-cta">
        <IoImageOutline size={40} aria-hidden="true" />
        <span className="font-medium">Photos à venir</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2 gap-2 h-[280px] sm:h-[360px] md:h-[clamp(360px,42vw,540px)] rounded-2xl overflow-hidden">
        {images.slice(0, 5).map((img, idx) => (
          <button
            type="button"
            key={img.src}
            aria-label={`Agrandir la photo : ${img.alt}`}
            onClick={() => handleClickImage(idx)}
            className={`relative overflow-hidden cursor-zoom-in ${
              idx === 0 ? "md:row-span-2" : "hidden md:block"
            }`}
          >
            {imageLoading.includes(img.src) && (
              <div className="skeleton w-full h-full absolute inset-0 z-10 rounded-none" />
            )}
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={idx === 0 ? "(min-width: 768px) 50vw, 100vw" : "25vw"}
              priority={idx === 0}
              className="object-cover hover:scale-105 transition-transform duration-300"
              onLoad={() => handleImageLoad(img.src)}
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleClickImage(0)}
          className="btn btn-sm h-11 absolute right-3 bottom-3 sm:right-4 sm:bottom-4 bg-surface text-base-content border-0 rounded-xl shadow-md gap-2"
        >
          <IoGridOutline size={16} aria-hidden="true" />
          Voir les {images.length} photos
        </button>
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <dialog
          className="modal modal-open"
          onClick={() => {
            setSelectedIndex(null);
            setModalLoading(false);
          }}
        >
          <div className="modal-box max-w-5xl p-0 bg-transparent shadow-none relative">
            {modalLoading && (
              <div className="flex justify-center items-center w-full h-[400px]">
                <span className="loading loading-spinner loading-lg text-primary" />
              </div>
            )}
            <Image
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              width={1200}
              height={800}
              className={`w-full h-auto rounded-lg ${
                modalLoading ? "hidden" : "block"
              }`}
              priority
            />

            {/* Flèches */}
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ›
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
