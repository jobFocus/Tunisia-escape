import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { regions } from "../data/regions";
import type { Region, Governorate, Monument } from "../data/regions";
import { governorates } from "../data/governorates";

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

const frenchToId: Record<string, string> = {
  Tunis: "tunis",
  Ariana: "ariana",
  "Ben Arous": "ben-arous",
  Mannouba: "manouba",
  Bizerte: "bizerte",
  Nabeul: "nabeul",
  Zaghouan: "zaghouan",
  "Béja": "beja",
  Jendouba: "jendouba",
  "Le Kef": "le-kef",
  "El Kef": "le-kef",
  Siliana: "siliana",
  Sousse: "sousse",
  Monastir: "monastir",
  Mahdia: "mahdia",
  Sfax: "sfax",
  Kairouan: "kairouan",
  Kasserine: "kasserine",
  "Sidi Bouzid": "sidi-bouzid",
  "Gabès": "gabes",
  "Médenine": "medenine",
  Tataouine: "tataouine",
  Gafsa: "gafsa",
  Tozeur: "tozeur",
  "Kébili": "kebili",
};

const normalizedFrenchMap: Map<string, string> = new Map();
for (const [key, val] of Object.entries(frenchToId)) {
  const norm = key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  normalizedFrenchMap.set(norm, val);
}

function getGovernorateId(frenchName: string): string | undefined {
  const direct = frenchToId[frenchName];
  if (direct) return direct;
  const norm = frenchName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalizedFrenchMap.get(norm);
}

function getGovernorateRegionId(govId: string): string | undefined {
  const gov = governorates.find((g) => g.id === govId);
  return gov?.regionId;
}

interface MapViewProps {
  onRegionSelect: (region: Region) => void;
  onGovernorateSelect: (gov: Governorate) => void;
  selectedGovernorateId: string | null;
  routeWaypoints: [number, number][] | null;
  onMonumentSelect: (monument: Monument) => void;
}

export default function MapView({
  onRegionSelect,
  onGovernorateSelect,
  selectedGovernorateId,
  routeWaypoints,
  onMonumentSelect,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const regionFillLayersRef = useRef<L.GeoJSON[]>([]);
  const routingRef = useRef<L.Routing.Control | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const hoveredGovIdRef = useRef<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  const selectedGovIdRef = useRef<string | null>(null);
  selectedGovIdRef.current = selectedGovernorateId;

  const onGovSelectRef = useRef(onGovernorateSelect);
  onGovSelectRef.current = onGovernorateSelect;
  const onRegionSelectRef = useRef(onRegionSelect);
  onRegionSelectRef.current = onRegionSelect;
  const onMonumentSelectRef = useRef(onMonumentSelect);
  onMonumentSelectRef.current = onMonumentSelect;

  // Fetch GeoJSON
  useEffect(() => {
    const url =
      "https://raw.githubusercontent.com/riatelab/tunisie/master/data/TN-gouvernorats.geojson";
    fetch(url)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [34.0, 9.5],
      zoom: 7,
      maxBounds: [
        [30.0, 7.0],
        [38.0, 12.0],
      ] as L.LatLngBoundsExpression,
      maxBoundsViscosity: 1,
    });

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

  // Render GeoJSON layers when data loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoData) return;

    // Clean up previous layers
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }
    regionFillLayersRef.current.forEach((l) => map.removeLayer(l));
    regionFillLayersRef.current = [];

    // Group features by region for region fill layers
    const regionFeatures: Record<string, any[]> = {};
    for (const feature of geoData.features) {
      const frenchName = feature.properties?.gouv_fr;
      const govId = getGovernorateId(frenchName);
      if (!govId) continue;
      const regionId = getGovernorateRegionId(govId);
      if (!regionId) continue;
      if (!regionFeatures[regionId]) regionFeatures[regionId] = [];
      regionFeatures[regionId].push(feature);
    }

    // Layer 1: Region fill layers (bottom, decorative only)
    for (const [regionId, features] of Object.entries(regionFeatures)) {
      const color = regionColors[regionId] || "#999";
      const regionLayer = L.geoJSON(
        { type: "FeatureCollection", features } as any,
        {
          style: {
            fillColor: color,
            fillOpacity: 0.12,
            color: color,
            weight: 2,
            opacity: 0.3,
          },
          interactive: true,
          onEachFeature: (_feature, layer) => {
            const region = regions.find((r) => r.id === regionId);
            if (!region) return;
            layer.on("click", () => {
              onRegionSelectRef.current(region);
            });
            layer.on("mouseover", () => {
              (layer as L.Path).setStyle({ fillOpacity: 0.22, opacity: 0.5 });
            });
            layer.on("mouseout", () => {
              (layer as L.Path).setStyle({ fillOpacity: 0.12, opacity: 0.3 });
            });
          },
        }
      ).addTo(map);
      regionFillLayersRef.current.push(regionLayer);
    }

    // Layer 2: Governorate polygon layer (on top, interactive)
    geoLayerRef.current = L.geoJSON(geoData as any, {
      style: (feature) => {
        const frenchName = feature?.properties?.gouv_fr;
        const govId = getGovernorateId(frenchName);
        const regionId = govId ? getGovernorateRegionId(govId) : undefined;
        const color = regionId ? regionColors[regionId] : "#999";
        const isSelected = govId === selectedGovIdRef.current;
        const isHovered = govId === hoveredGovIdRef.current;

        return {
          fillColor: color,
          fillOpacity: isSelected ? 0.7 : isHovered ? 0.55 : 0.25,
          color: isSelected ? "#111" : isHovered ? "#333" : "#fff",
          weight: isSelected ? 3 : isHovered ? 2.5 : 0.8,
          opacity: 1,
        };
      },
      onEachFeature: (feature, layer) => {
        const frenchName = feature.properties?.gouv_fr;
        const govId = getGovernorateId(frenchName);
        if (!govId) return;

        const gov = governorates.find((g) => g.id === govId);
        const regionId = getGovernorateRegionId(govId);
        const region = regionId
          ? regions.find((r) => r.id === regionId)
          : null;

        layer.bindTooltip(
          `<strong>${gov?.name || frenchName}</strong>${
            region ? `<br/><em>${region.name}</em>` : ""
          }`,
          { direction: "center", className: "custom-tooltip" }
        );

        layer.on({
          click: () => {
            if (gov) {
              onGovSelectRef.current(gov);
            }
          },
          mouseover: () => {
            hoveredGovIdRef.current = govId;
            if (geoLayerRef.current) {
              geoLayerRef.current.eachLayer((l) => {
                geoLayerRef.current!.resetStyle(l);
              });
            }
          },
          mouseout: () => {
            hoveredGovIdRef.current = null;
            if (geoLayerRef.current) {
              geoLayerRef.current.eachLayer((l) => {
                geoLayerRef.current!.resetStyle(l);
              });
            }
          },
        });
      },
    }).addTo(map);
  }, [geoData]);

  // Update styles when selectedGovernorateId changes
  useEffect(() => {
    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer) => {
        geoLayerRef.current!.resetStyle(layer);
      });
    }
  }, [selectedGovernorateId]);

  // Fly to selected governorate
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedGovernorateId) return;
    const gov = governorates.find((g) => g.id === selectedGovernorateId);
    if (gov) {
      map.flyTo([gov.lat, gov.lng], 9, { duration: 1 });
    }
  }, [selectedGovernorateId]);

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

  // Legend overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (legendRef.current) {
      legendRef.current.remove();
    }

    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.background = "white";
      div.style.padding = "10px 12px";
      div.style.borderRadius = "4px";
      div.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
      div.style.fontSize = "13px";
      div.style.lineHeight = "1.6";

      let html = "<div style='font-weight:600;margin-bottom:4px'>Regions</div>";
      for (const region of regions) {
        const color = regionColors[region.id] || "#999";
        html += `<div data-region="${region.id}" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:1px 4px;border-radius:3px">
          <span style="display:inline-block;width:14px;height:14px;background:${color};border-radius:2px;border:1px solid rgba(0,0,0,0.2)"></span>
          <span>${region.name}</span>
        </div>`;
      }
      div.innerHTML = html;

      L.DomEvent.disableClickPropagation(div);

      for (const el of div.querySelectorAll<HTMLElement>("[data-region]")) {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-region");
          const region = regions.find((r) => r.id === id);
          if (region) onRegionSelect(region);
        });
      }

      return div;
    };

    legend.addTo(map);
    legendRef.current = legend;

    return () => {
      if (legendRef.current) {
        legendRef.current.remove();
        legendRef.current = null;
      }
    };
  }, [onRegionSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}
