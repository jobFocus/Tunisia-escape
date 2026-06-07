import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import RegionPanel from "./components/RegionPanel";
import MonumentPopup from "./components/MonumentPopup";
import type { Region, Governorate, Monument } from "./data/regions";
import { governorates } from "./data/governorates";

function App() {
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][] | null>(null);
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);

  const handleRegionSelect = useCallback((_region: Region) => {
    setSelectedGovernorate(null);
    setRouteWaypoints(null);
  }, []);

  const handleGovernorateSelect = useCallback((gov: Governorate | null) => {
    setSelectedGovernorate(gov);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedGovernorate(null);
    setRouteWaypoints(null);
  }, []);

  const handleRequestRoute = useCallback((monuments: Monument[]) => {
    const waypoints: [number, number][] = monuments.map((m) => [m.lat, m.lng]);
    setRouteWaypoints(waypoints);
  }, []);

  const handleMonumentSelect = useCallback((monument: Monument) => {
    setSelectedMonument(monument);
  }, []);

  const handleCloseMonument = useCallback(() => {
    setSelectedMonument(null);
  }, []);

  const handleNavigateToMonument = useCallback((monument: Monument) => {
    const gov = governorates.find((g) =>
      g.monuments.some((m) => m.id === monument.id)
    );
    if (gov) {
      handleGovernorateSelect(gov);
    }
    setSelectedMonument(null);
  }, [handleGovernorateSelect]);

  return (
    <div className="flex w-full h-screen">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow text-sm font-medium">
          Tunisia Map Explorer
        </div>
        <MapView
          onRegionSelect={handleRegionSelect}
          onGovernorateSelect={handleGovernorateSelect}
          selectedGovernorateId={selectedGovernorate?.id ?? null}
          routeWaypoints={routeWaypoints}
          onMonumentSelect={handleMonumentSelect}
        />
      </div>
      <aside className="w-[380px] border-l border-gray-200 bg-white shadow-lg overflow-hidden flex flex-col">
        <RegionPanel
          selectedGovernorate={selectedGovernorate}
          onGovernorateClick={handleGovernorateSelect}
          onClearSelection={handleClearSelection}
          onRequestRoute={handleRequestRoute}
          onMonumentSelect={handleMonumentSelect}
        />
      </aside>
      {selectedMonument && (
        <MonumentPopup
          monument={selectedMonument}
          onClose={handleCloseMonument}
          onNavigate={handleNavigateToMonument}
        />
      )}
    </div>
  );
}

export default App;
