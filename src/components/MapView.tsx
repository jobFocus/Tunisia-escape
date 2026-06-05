import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { regions } from "../data/regions";
import type { Region, Governorate } from "../data/regions";
import { governorates } from "../data/governorates";

// Fix default marker icon path issues with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const regionColors: Record<string, string> = {
  "grand-tunis": "#e74c3c",
  "nord-est": "#3498db",
  "nord-ouest": "#2ecc71",
  "centre-est": "#f39c12",
  "centre-ouest": "#9b59b6",
  sud: "#e67e22",
};

interface MapViewProps {
  onRegionSelect: (region: Region) => void;
  onGovernorateSelect: (gov: Governorate) => void;
  selectedRegionId: string | null;
  selectedGovernorateId: string | null;
  routeWaypoints: [number, number][] | null;
}

export default function MapView({
  onRegionSelect,
  onGovernorateSelect,
  selectedRegionId,
  selectedGovernorateId,
  routeWaypoints,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const govMarkersRef = useRef<L.Marker[]>([]);
  const routingRef = useRef<L.Routing.Control | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [34.0, 9.5],
      7
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add region markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    regions.forEach((region) => {
      const color = regionColors[region.id] || "#999";
      const isSelected = region.id === selectedRegionId;

      const marker = L.circleMarker([region.centerLat, region.centerLng], {
        radius: isSelected ? 16 : 12,
        fillColor: color,
        color: isSelected ? "#000" : "#fff",
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.9 : 0.6,
      }).addTo(map);

      marker.bindTooltip(
        `<strong>${region.name}</strong><br/>${region.nameAr}`,
        {
          direction: "top",
          offset: [0, isSelected ? -18 : -14],
          className: "custom-tooltip",
        }
      );

      marker.on("click", () => {
        onRegionSelect(region);
      });

      markersRef.current.push(marker);
    });
  }, [selectedRegionId, onRegionSelect]);

  // Add governorate markers for selected region
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    govMarkersRef.current.forEach((m) => m.remove());
    govMarkersRef.current = [];

    if (!selectedRegionId) return;

    const regionGovs = governorates.filter(
      (g) => g.regionId === selectedRegionId
    );

    const monumentIcon = L.divIcon({
      className: "custom-monument-marker",
      html: `<div style="background:#c0392b;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">★</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const govIcon = (g: Governorate) =>
      L.divIcon({
        className: "custom-gov-marker",
        html: `<div style="background:${selectedGovernorateId === g.id ? "#1a5276" : regionColors[selectedRegionId] || "#666"};color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

    regionGovs.forEach((gov) => {
      const marker = L.marker([gov.lat, gov.lng], { icon: govIcon(gov) }).addTo(
        map
      );
      marker.bindPopup(
        `<strong>${gov.name}</strong> (${gov.nameAr})<br/><em>${gov.cuisine}</em>`
      );
      marker.on("click", () => onGovernorateSelect(gov));
      govMarkersRef.current.push(marker);

      // Add monument markers
      gov.monuments.forEach((mon) => {
        const m = L.marker([mon.lat, mon.lng], { icon: monumentIcon }).addTo(
          map
        );
        const imgTag = mon.imageUrl
          ? `<img src="${mon.imageUrl}" alt="${mon.name}" style="width:200px;height:auto;border-radius:4px;margin-top:4px;"/>`
          : "";
        m.bindPopup(
          `<strong>${mon.name}</strong> (${mon.nameAr})<br/>${mon.description}${imgTag}`
        );
        govMarkersRef.current.push(m);
      });
    });
  }, [selectedRegionId, selectedGovernorateId, onGovernorateSelect]);

  // Route waypoints
  const buildRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !routeWaypoints || routeWaypoints.length < 2) {
      if (routingRef.current) {
        routingRef.current.getPlan().setWaypoints([]);
      }
      return;
    }

    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    try {
      const waypoints = routeWaypoints.map(([lat, lng]) =>
        L.latLng(lat, lng)
      );

      routingRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: "#e74c3c", weight: 4, opacity: 0.8 }],
        },
        createMarker: () => null,
        addWaypoints: false,
        fitSelectedRoutes: false,
      } as any).addTo(map);
    } catch (e) {
      console.warn("Routing error:", e);
    }
  }, [routeWaypoints]);

  useEffect(() => {
    buildRoute();
  }, [buildRoute]);

  // Cleanup routing on unmount
  useEffect(() => {
    return () => {
      if (routingRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingRef.current);
        } catch {}
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
