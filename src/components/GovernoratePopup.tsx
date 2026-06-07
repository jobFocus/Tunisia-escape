import { useEffect, useRef, useState } from "react";
import type { Governorate, Monument } from "../data/regions";
import { governorates } from "../data/governorates";

interface GovernoratePopupProps {
  governorate: Governorate;
  onClose: () => void;
  onNavigateToMonument: (monument: Monument) => void;
  onSelectGovernorate: (gov: Governorate | null) => void;
}

function to4k(url: string): string {
  return url
    .replace(/\/320px-/, "/")
    .replace(/w=400&q=80/, "w=1920&q=90");
}

export default function GovernoratePopup({
  governorate,
  onClose,
  onNavigateToMonument,
  onSelectGovernorate,
}: GovernoratePopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselTimer = useRef<ReturnType<typeof setInterval>>();
  const [showVideo, setShowVideo] = useState(false);

  const images = governorate.monuments.map((m) => to4k(m.imageUrl));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (images.length > 1) {
      carouselTimer.current = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % images.length);
      }, 4000);
    }
    return () => {
      if (carouselTimer.current) clearInterval(carouselTimer.current);
    };
  }, [images.length]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const regionLabels: Record<string, string> = {
    "grand-tunis": "Grand Tunis",
    "nord-est": "Nord-Est",
    "nord-ouest": "Nord-Ouest",
    "centre-est": "Centre-Est",
    "centre-ouest": "Centre-Ouest",
    sud: "Sud",
  };

  const handleShowGov = (govId: string) => {
    const gov = governorates.find((g) => g.id === govId);
    if (gov) onSelectGovernorate(gov);
  };

  const adjacentGovernorates = governorates
    .filter((g) => g.regionId === governorate.regionId && g.id !== governorate.id)
    .slice(0, 4);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="relative w-[95vw] max-w-5xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out] flex flex-col">
        {/* --- Hero Section --- */}
        <div className="relative h-[45vh] min-h-[280px] overflow-hidden">
          <img
            src={governorate.heroImage}
            alt={governorate.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (images.length > 0) {
                (e.target as HTMLImageElement).src = images[0];
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white text-lg hover:bg-black/60 transition-colors z-10"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
              <span>{regionLabels[governorate.regionId] || governorate.regionId}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {governorate.name}
            </h2>
            <p className="text-white/60 text-sm" dir="rtl">{governorate.nameAr}</p>
            <div className="flex gap-6 mt-3 text-white/80 text-sm">
              <span>👥 {governorate.population}</span>
              <span>📐 {governorate.area}</span>
            </div>
          </div>
        </div>

        {/* --- Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Video (if available) */}
          {governorate.videoUrl && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Video</h3>
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showVideo ? "Hide" : "Show"} video
                </button>
              </div>
              {showVideo && (
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={governorate.videoUrl}
                    title={`${governorate.name} video`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Carousel */}
          {images.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Photos — 4K Gallery
              </h3>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100">
                <img
                  src={images[carouselIndex]}
                  alt={`${governorate.name} ${carouselIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === carouselIndex
                            ? "bg-white w-5"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Culture</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{governorate.culture}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Traditions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{governorate.traditions}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Cuisine</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{governorate.cuisine}</p>
            </div>
          </div>

          {/* Places to Visit */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Places to Visit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {governorate.monuments.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onNavigateToMonument(m)}
                  className="group relative rounded-xl overflow-hidden bg-gray-50 border border-gray-200 hover:border-blue-300 transition-all text-left"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={to4k(m.imageUrl)}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{m.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nearby Governorates */}
          {adjacentGovernorates.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Explore more in {regionLabels[governorate.regionId] || governorate.regionId}
              </h3>
              <div className="flex flex-wrap gap-2">
                {adjacentGovernorates.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleShowGov(g.id)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-sm font-medium text-gray-700 transition-colors"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
