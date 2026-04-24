import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="0.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8" y="8" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PropertyPhotoGallery({
  images,
  address,
}: PropertyPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const totalPhotos = images.length;
  const heroImage = images[0];
  const previewImages: (string | null)[] = [
    images[1] ?? null,
    images[2] ?? null,
    images[3] ?? null,
    images[4] ?? null,
  ];
  const showViewAllPill = totalPhotos > 5;

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const tileBaseClass =
    "group relative overflow-hidden cursor-pointer transition-[filter,opacity] duration-150 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  const placeholderClass =
    "w-full h-full bg-gradient-to-br from-[var(--surface-2-hex)] via-[var(--surface-hex)] to-[var(--bg-hex)]";

  const backPill = (
    <Link
      href="/properties"
      className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60"
      data-testid="link-back-properties"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Link>
  );

  const renderViewAllPill = (testId: string) =>
    showViewAllPill ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openLightboxAt(0);
        }}
        className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-2 rounded-[8px] bg-black/75 px-3.5 py-2 text-[13px] font-medium text-white backdrop-blur-md transition-colors hover:bg-black/85"
        data-testid={testId}
      >
        <GridIcon className="text-white" />
        View all {totalPhotos} photos
      </button>
    ) : null;

  return (
    <>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-6">
        {/* Mobile: single hero with View All overlay */}
        <div className="md:hidden">
          <div
            role={heroImage ? "button" : undefined}
            tabIndex={heroImage ? 0 : undefined}
            onClick={() => heroImage && openLightboxAt(0)}
            onKeyDown={(e) => {
              if (heroImage && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                openLightboxAt(0);
              }
            }}
            className="relative w-full overflow-hidden rounded-[12px] bg-[var(--surface-hex)] shadow-xl ring-1 ring-black/5"
            style={{ aspectRatio: "4 / 3" }}
            data-testid="gallery-mobile-hero"
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt={address}
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 42%" }}
              />
            ) : (
              <div className={placeholderClass} />
            )}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
            {backPill}
            {renderViewAllPill("button-open-gallery-mobile")}
          </div>
        </div>

        {/* Desktop: asymmetric 5-tile grid */}
        <div className="hidden md:block">
          <div
            className="relative overflow-hidden rounded-[12px] bg-[var(--surface-hex)] p-3 shadow-xl ring-1 ring-black/5"
            data-testid="gallery-desktop-grid"
          >
            <div
              className="grid h-[500px] w-full gap-1.5"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr",
              }}
            >
              {/* Hero — photo 0, spans both rows */}
              <div
                role={heroImage ? "button" : undefined}
                tabIndex={heroImage ? 0 : undefined}
                onClick={() => heroImage && openLightboxAt(0)}
                onKeyDown={(e) => {
                  if (heroImage && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    openLightboxAt(0);
                  }
                }}
                className={`${tileBaseClass} rounded-l-[8px]`}
                style={{ gridColumn: "1 / 2", gridRow: "1 / 3" }}
                data-testid="gallery-tile-hero"
                aria-label={heroImage ? `Open photo 1 of ${totalPhotos}` : undefined}
              >
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={address}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "50% 42%" }}
                  />
                ) : (
                  <div className={placeholderClass} />
                )}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
                {backPill}
              </div>

              {/* Preview tiles — photos 1-4 */}
              {previewImages.map((image, i) => {
                const photoIndex = i + 1;
                const isLastTile = i === 3;
                const cornerClass =
                  i === 0
                    ? "rounded-tr-[8px]"
                    : i === 1
                      ? ""
                      : i === 2
                        ? ""
                        : "rounded-br-[8px]";

                return (
                  <div
                    key={i}
                    role={image ? "button" : undefined}
                    tabIndex={image ? 0 : undefined}
                    onClick={() => image && openLightboxAt(photoIndex)}
                    onKeyDown={(e) => {
                      if (image && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        openLightboxAt(photoIndex);
                      }
                    }}
                    className={`${image ? tileBaseClass : "relative overflow-hidden"} ${cornerClass}`}
                    data-testid={`gallery-tile-${photoIndex}`}
                    aria-label={image ? `Open photo ${photoIndex + 1} of ${totalPhotos}` : undefined}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${address} photo ${photoIndex + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ background: "var(--surface-2-hex)" }}
                      />
                    )}
                    {isLastTile && renderViewAllPill("button-open-gallery")}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
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
          view: ({ index }) => setLightboxIndex(index),
        }}
      />
    </>
  );
}
