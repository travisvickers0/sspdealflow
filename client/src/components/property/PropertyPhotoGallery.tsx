import { Link } from "wouter";
import { ChevronLeft, Images } from "lucide-react";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

interface PropertyPhotoGalleryProps {
  images: string[];
  address: string;
}

export function PropertyPhotoGallery({
  images,
  address,
}: PropertyPhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = images[selectedImage];

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-6">
        <div className="overflow-hidden rounded-2xl bg-[var(--surface-hex)] shadow-xl ring-1 ring-black/5">
          <div className="relative h-[240px] sm:h-[340px] lg:h-[460px]">
            {activeImage ? (
              <img
                key={activeImage}
                src={activeImage}
                alt={address}
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 42%" }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-hex)] via-[var(--surface-2-hex)] to-[var(--bg-hex)]" />
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

            <Link
              href="/properties"
              className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/45"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>

            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/45"
                data-testid="button-open-gallery"
              >
                <Images className="h-4 w-4" />
                <span className="hidden sm:inline">View All Photos</span>
                <span className="sm:hidden">Photos</span>
              </button>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 z-20 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="border-t border-[var(--line)] bg-[var(--surface-hex)] px-3 py-3 sm:px-4">
              <div className="flex gap-2 overflow-x-auto sm:gap-3">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`group relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg transition-all sm:h-20 sm:w-20 lg:h-[88px] lg:w-[88px] ${
                      selectedImage === index
                        ? "ring-2 ring-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)]"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`Select photo ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${address} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div
                      className={`absolute inset-0 transition-colors ${
                        selectedImage === index
                          ? "bg-transparent"
                          : "bg-black/10 group-hover:bg-black/0"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedImage}
        slides={images.map((src) => ({ src }))}
        plugins={[Thumbnails, Counter, Zoom]}
        thumbnails={{
          position: "bottom",
          width: 100,
          height: 70,
          gap: 8,
          padding: 8,
        }}
        counter={{
          container: {
            style: {
              top: "unset",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
            },
          },
        }}
        carousel={{
          finite: false,
          preload: 3,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        }}
        on={{
          view: ({ index }) => setSelectedImage(index),
        }}
      />
    </>
  );
}
