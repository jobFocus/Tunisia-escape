import { useEffect, useRef } from "react";
import type { Monument } from "../data/regions";

interface MonumentPopupProps {
  monument: Monument;
  onClose: () => void;
  onNavigate: (monument: Monument) => void;
}

export default function MonumentPopup({ monument, onClose, onNavigate }: MonumentPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center sm:justify-end sm:p-6 bg-black/30 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out] sm:mr-4 sm:mb-4 sm:max-w-sm">
        <div className="relative">
          <img
            src={monument.imageUrl || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80"}
            alt={monument.name}
            className="w-full h-56 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80";
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white text-lg hover:bg-black/60 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{monument.name}</h3>
            <p className="text-sm text-gray-500" dir="rtl">{monument.nameAr}</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{monument.description}</p>
          <button
            onClick={() => onNavigate(monument)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>📍</span>
            <span>Navigate to</span>
          </button>
        </div>
      </div>
    </div>
  );
}
