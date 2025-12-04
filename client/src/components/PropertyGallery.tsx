import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  address: string;
}

export function PropertyGallery({ images, address }: PropertyGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return <div className="aspect-video bg-muted rounded-2xl" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted aspect-video group cursor-pointer"
      >
        <img
          src={images[index]}
          alt={`${address} - image ${index + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0 1 1 0 01-2 0z" />
            </svg>
          </div>
        </div>

        {/* Image counter - Mobile visible, desktop on hover */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {index + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Grid - Show if more than 1 image */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative rounded-lg sm:rounded-lg overflow-hidden aspect-square transition-all ${
                i === index
                  ? "ring-2 ring-primary shadow-md"
                  : "ring-1 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={images.map((img) => ({ src: img }))}
        index={index}
        on={{
          view: ({ index: currentIndex }) => setIndex(currentIndex),
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
        }}
        render={{
          buttonPrev: images.length > 1 ? undefined : () => null,
          buttonNext: images.length > 1 ? undefined : () => null,
          iconPrev: () => (
            <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
          ),
          iconNext: () => (
            <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
          ),
          iconClose: () => (
            <X className="w-8 h-8 text-white drop-shadow-lg" />
          ),
        }}
        carousel={{
          preload: 2,
        }}
      />
    </div>
  );
}
