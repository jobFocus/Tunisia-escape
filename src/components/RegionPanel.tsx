import type { Region, Governorate, Monument } from "../data/regions";
import { governorates } from "../data/governorates";

const colors: Record<string, string> = {
  "grand-tunis": "#e74c3c",
  "nord-est": "#3498db",
  "nord-ouest": "#2ecc71",
  "centre-est": "#f39c12",
  "centre-ouest": "#9b59b6",
  sud: "#e67e22",
};

interface RegionPanelProps {
  selectedRegion: Region | null;
  selectedGovernorate: Governorate | null;
  onGovernorateClick: (gov: Governorate) => void;
  onRequestRoute: (monuments: Monument[]) => void;
}

export default function RegionPanel({
  selectedRegion,
  selectedGovernorate,
  onGovernorateClick,
  onRequestRoute,
}: RegionPanelProps) {
  if (!selectedRegion && !selectedGovernorate) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Tunisia Tourist Map
        </h2>
        <p className="text-center text-sm leading-relaxed">
          Click a <strong>region</strong> on the map to explore its culture,
          cuisine, and monuments, then plan your route!
        </p>
      </div>
    );
  }

  const region = selectedRegion;
  const gov = selectedGovernorate;
  const regionGovs = region
    ? governorates.filter((g) => g.regionId === region.id)
    : [];
  const allMonuments = gov
    ? gov.monuments
    : regionGovs.flatMap((g) => g.monuments);
  const color = region ? colors[region.id] || "#666" : "#666";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Region header */}
      {region && (
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-xl font-bold">{region.name}</h2>
            <span className="text-sm text-gray-500" dir="rtl">
              {region.nameAr}
            </span>
          </div>
          <p className="text-sm text-gray-600">{region.description}</p>
        </div>
      )}

      {/* Governorate detail */}
      {gov && (
        <div className="p-4 border-b bg-blue-50">
          <h3 className="text-lg font-bold text-blue-900">
            {gov.name}{" "}
            <span className="text-sm font-normal text-blue-600" dir="rtl">
              {gov.nameAr}
            </span>
          </h3>

          <div className="mt-3 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                Culture & Heritage
              </h4>
              <p className="text-sm text-gray-700 mt-0.5">{gov.culture}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                Traditions
              </h4>
              <p className="text-sm text-gray-700 mt-0.5">{gov.traditions}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                Cuisine
              </h4>
              <p className="text-sm text-gray-700 mt-0.5">{gov.cuisine}</p>
            </div>
          </div>
        </div>
      )}

      {/* Governorates list */}
      {region && !gov && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Governorates
          </h3>
          <div className="flex flex-wrap gap-2">
            {regionGovs.map((g) => (
              <button
                key={g.id}
                onClick={() => onGovernorateClick(g)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors hover:bg-gray-100"
                style={{
                  borderColor: color,
                  color: "#333",
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monuments */}
      {allMonuments.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Famous Monuments ({allMonuments.length})
            </h3>
            <button
              onClick={() => onRequestRoute(allMonuments)}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#e74c3c" }}
            >
              🚗 Plan Route
            </button>
          </div>

          <div className="space-y-3">
            {allMonuments.map((mon) => (
              <MonumentCard key={mon.id} monument={mon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MonumentCard({ monument }: { monument: Monument }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {monument.imageUrl && (
        <img
          src={monument.imageUrl}
          alt={monument.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-3">
        <h4 className="font-semibold text-sm">
          {monument.name}{" "}
          <span className="text-xs text-gray-400" dir="rtl">
            {monument.nameAr}
          </span>
        </h4>
        <p className="text-xs text-gray-600 mt-1">{monument.description}</p>
      </div>
    </div>
  );
}
