import type { Governorate, Monument } from "../data/regions";
import { governorates } from "../data/governorates";
import { regions } from "../data/regions";

const colors: Record<string, string> = {
  "grand-tunis": "#e74c3c",
  "nord-est": "#3498db",
  "nord-ouest": "#2ecc71",
  "centre-est": "#f39c12",
  "centre-ouest": "#9b59b6",
  sud: "#e67e22",
};

const regionNames: Record<string, string> = {
  "grand-tunis": "Grand Tunis",
  "nord-est": "Nord-Est",
  "nord-ouest": "Nord-Ouest",
  "centre-est": "Centre-Est",
  "centre-ouest": "Centre-Ouest",
  sud: "Sud",
};

interface RegionPanelProps {
  selectedGovernorate: Governorate | null;
  onGovernorateClick: (gov: Governorate | null) => void;
  onClearSelection: () => void;
  onRequestRoute: (monuments: Monument[]) => void;
  onMonumentSelect: (monument: Monument) => void;
}

export default function RegionPanel({
  selectedGovernorate,
  onGovernorateClick,
  onClearSelection,
  onRequestRoute,
  onMonumentSelect,
}: RegionPanelProps) {
  if (!selectedGovernorate) {
    const regionIds = Object.keys(colors);

    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="p-5 border-b bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🇹🇳</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Tunisia</h2>
              <p className="text-sm text-gray-500" dir="rtl">تونس</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Fact label="Capital" value="Tunis" />
            <Fact label="Population" value="~12.4 million" />
            <Fact label="Language" value="Arabic, French" />
            <Fact label="Currency" value="TND (Dinar)" />
            <Fact label="Area" value="163,610 km²" />
            <Fact label="Governorates" value="24" />
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            North African gem on the Mediterranean coast — from the golden beaches of the Sahel to the Saharan dunes of the Jerid, Tunisia offers millennia of history, diverse landscapes, and warm hospitality across its 6 regions.
          </p>
        </div>

        <div className="flex-1">
          {regionIds.map((regionId) => {
            const region = regions.find((r) => r.id === regionId);
            const regionGovs = governorates.filter((g) => g.regionId === regionId);
            const color = colors[regionId] || "#666";
            if (regionGovs.length === 0) return null;

            return (
              <div key={regionId} className="px-4 pt-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {regionNames[regionId]}
                    {region && <span className="text-gray-300 ms-1.5 normal-case font-normal" dir="rtl">{region.nameAr}</span>}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {regionGovs.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onGovernorateClick(g)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border hover:shadow-sm active:scale-95"
                      style={{
                        borderColor: color,
                        color: color,
                        backgroundColor: `${color}08`,
                      }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const gov = selectedGovernorate;
  const region = regions.find((r) => r.id === gov.regionId);
  const color = region ? colors[region.id] || "#666" : "#666";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b">
        <button
          onClick={onClearSelection}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-800 transition-colors w-full text-left"
        >
          <span>←</span>
          <span>All Governorates</span>
        </button>
      </div>

      <div className="p-4 bg-blue-50 border-b">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: color }}
          />
          <h2 className="text-xl font-bold text-blue-900">
            {gov.name}
            <span className="text-sm font-normal text-blue-600 ms-2" dir="rtl">
              {gov.nameAr}
            </span>
          </h2>
        </div>
        {region && (
          <p className="text-xs text-blue-500 font-medium">{region.name}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
          <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Population</p>
            <p className="text-sm font-semibold text-gray-700">{gov.population}</p>
          </div>
          <div className="bg-white/70 rounded-lg px-2.5 py-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Area</p>
            <p className="text-sm font-semibold text-gray-700">{gov.area}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <DetailBlock title="Culture & Heritage" text={gov.culture} />
          <DetailBlock title="Traditions" text={gov.traditions} />
          <DetailBlock title="Cuisine" text={gov.cuisine} />
        </div>
      </div>

      {gov.monuments.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Places to Visit ({gov.monuments.length})
            </h3>
            <button
              onClick={() => onRequestRoute(gov.monuments)}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#e74c3c" }}
            >
              🚗 Plan Route
            </button>
          </div>
          <div className="space-y-3">
            {gov.monuments.map((mon) => (
              <MonumentCard key={mon.id} monument={mon} onSelect={onMonumentSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-lg px-2.5 py-1.5">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide">{title}</h4>
      <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{text}</p>
    </div>
  );
}

function MonumentCard({ monument, onSelect }: { monument: Monument; onSelect: (m: Monument) => void }) {
  return (
    <div
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(monument)}
    >
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
          {monument.name}
          <span className="text-xs text-gray-400 ms-1" dir="rtl">
            {monument.nameAr}
          </span>
        </h4>
        <p className="text-xs text-gray-600 mt-1">{monument.description}</p>
      </div>
    </div>
  );
}
