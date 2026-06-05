import { useState, useCallback } from "react";
import MapView from "./components/MapView";
import RegionPanel from "./components/RegionPanel";
import type { Region, Governorate, Monument } from "./data/regions";

function App() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [routeWaypoints, setRouteWaypoints] = useState<[number, number][] | null>(null);

  const handleRegionSelect = useCallback((region: Region) => {
    setSelectedRegion(region);
    setSelectedGovernorate(null);
    setRouteWaypoints(null);
  }, []);

  const handleGovernorateSelect = useCallback((gov: Governorate) => {
    setSelectedGovernorate(gov);
  }, []);

  const handleRequestRoute = useCallback((monuments: Monument[]) => {
    const waypoints: [number, number][] = monuments.map((m) => [m.lat, m.lng]);
    setRouteWaypoints(waypoints);
  }, []);

  return (
    <div className="flex w-full h-screen">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow text-sm font-medium">
          Tunisia Map Explorer
        </div>
        <MapView
          onRegionSelect={handleRegionSelect}
          onGovernorateSelect={handleGovernorateSelect}
          selectedRegionId={selectedRegion?.id ?? null}
          selectedGovernorateId={selectedGovernorate?.id ?? null}
          routeWaypoints={routeWaypoints}
        />
      </div>
      <aside className="w-[380px] border-l border-gray-200 bg-white shadow-lg overflow-hidden flex flex-col">
        <RegionPanel
          selectedRegion={selectedRegion}
          selectedGovernorate={selectedGovernorate}
          onGovernorateClick={handleGovernorateSelect}
          onRequestRoute={handleRequestRoute}
        />
      </aside>
    </div>
  );
}

export default App;
