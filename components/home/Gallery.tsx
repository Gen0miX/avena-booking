"use client";
import Image from "next/image";
import { useState } from "react";
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
      <div className="flex items-center justify-center h-[300px] md:h-[400px] pb-5 rounded-xl border-2 border-primary/40 bg-base-200 text-base-content/60">
        Galerie à venir
      </div>
    );
  }

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
              onClick={() => handleClickImage(idx)}
              onLoad={() => handleImageLoad(img.src)}
            />
          </div>
        ))}
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
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl font-bold bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
            <button
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
