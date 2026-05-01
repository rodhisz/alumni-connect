"use client"

import React, { useState, useMemo } from "react"
import { 
  Map, 
  MapClusterLayer, 
  MapPopup, 
  MapControls 
} from "./ui/map"

type MapData = { name: string, count: number, coordinates?: [number, number] | null }

const coordinateDictionary: Record<string, [number, number]> = {
  // ── Indonesia Provinces ──────────────────────────────────
  "DKI Jakarta, Indonesia": [106.8456, -6.2088],
  "Jawa Barat, Indonesia": [107.6191, -6.9175],
  "Jawa Tengah, Indonesia": [110.4225, -6.9697],
  "Jawa Timur, Indonesia": [112.7521, -7.2504],
  "Banten, Indonesia": [106.1090, -6.1200],
  "DI Yogyakarta, Indonesia": [110.3608, -7.7956],
  "Bali, Indonesia": [115.1889, -8.4095],
  "Sumatera Utara, Indonesia": [98.6722, 3.5952],
  "Sumatera Barat, Indonesia": [100.3719, -0.9471],
  "Sumatera Selatan, Indonesia": [104.7565, -2.9909],
  "Riau, Indonesia": [101.4478, 0.5071],
  "Kepulauan Riau, Indonesia": [104.4587, 1.1444],
  "Jambi, Indonesia": [103.6131, -1.6101],
  "Bengkulu, Indonesia": [102.2655, -3.8004],
  "Lampung, Indonesia": [105.2663, -5.4292],
  "Bangka Belitung, Indonesia": [106.1138, -2.1317],
  "Aceh, Indonesia": [96.7491, 4.6951],
  "Nusa Tenggara Barat, Indonesia": [116.3249, -8.6529],
  "Nusa Tenggara Timur, Indonesia": [123.5833, -10.1707],
  "Kalimantan Barat, Indonesia": [109.3332, -0.0263],
  "Kalimantan Tengah, Indonesia": [113.9213, -2.2161],
  "Kalimantan Selatan, Indonesia": [114.5910, -3.3167],
  "Kalimantan Timur, Indonesia": [117.1533, -0.4948],
  "Kalimantan Utara, Indonesia": [117.3654, 3.3274],
  "Sulawesi Utara, Indonesia": [124.8484, 1.4748],
  "Sulawesi Tengah, Indonesia": [119.8707, -0.8917],
  "Sulawesi Selatan, Indonesia": [119.4327, -5.1476],
  "Sulawesi Tenggara, Indonesia": [122.5149, -3.9722],
  "Sulawesi Barat, Indonesia": [119.3324, -2.6736],
  "Gorontalo, Indonesia": [123.0594, 0.5435],
  "Maluku, Indonesia": [128.1762, -3.6547],
  "Maluku Utara, Indonesia": [127.3842, 0.7369],
  "Papua, Indonesia": [140.7181, -2.5916],
  "Papua Barat, Indonesia": [134.0642, -0.8615],

  // ── Asia ──────────────────────────────────────────────────
  "Japan": [138.2529, 36.2048],
  "Malaysia": [101.9758, 4.2105],
  "Singapore": [103.8198, 1.3521],
  "Thailand": [100.9925, 15.8700],
  "Vietnam": [108.2772, 14.0583],
  "South Korea": [127.7669, 35.9078],
  "China": [104.1954, 35.8617],
  "Taiwan": [120.9605, 23.6978],
  "India": [78.9629, 20.5937],
  "Philippines": [121.7740, 12.8797],
  "Cambodia": [104.9160, 12.5657],

  // ── Middle East ───────────────────────────────────────────
  "Saudi Arabia": [45.0792, 23.8859],
  "Turkey": [35.2433, 38.9637],
  "United Arab Emirates": [53.8478, 23.4241],

  // ── Europe ────────────────────────────────────────────────
  "United Kingdom": [ -3.4360, 55.3781],
  "Germany": [10.4515, 51.1657],
  "France": [2.2137, 46.2276],
  "Netherlands": [5.2913, 52.1326],
  "Italy": [12.5674, 41.8719],

  // ── Americas ──────────────────────────────────────────────
  "United States": [-95.7129, 37.0902],
  "Canada": [-106.3468, 56.1304],
  "Brazil": [-51.9253, -14.2350],

  // ── Oceania ───────────────────────────────────────────────
  "Australia": [133.7751, -25.2744],
  "New Zealand": [174.8860, -40.9006],
}

interface WorldMapProps {
  data: MapData[]
}

interface AlumniProperties {
  name: string;
  count: number;
}

export default function WorldMap({ data }: WorldMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<{
    coordinates: [number, number];
    properties: AlumniProperties;
  } | null>(null);

  const geojson = useMemo(() => {
    const features = data
      .map(item => ({
        ...item,
        coordinates: item.coordinates || coordinateDictionary[item.name] || null
      }))
      .filter(m => m.coordinates !== null)
      .flatMap((m) => {
        // To make clusters count alumni, we generate 'count' number of points at each location
        // MapLibre clustering counts features (points)
        return Array.from({ length: m.count }).map((_, i) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: m.coordinates as [number, number],
          },
          properties: {
            name: m.name,
            count: m.count, // Storing original count for tooltip
          },
        }));
      });

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [data]);

  return (
    <div className="relative w-full h-full rounded-[3rem] overflow-hidden group/map border border-white/5 dark:border-zinc-800/20 bg-zinc-100/50 dark:bg-zinc-950/50">
      <Map
        center={[106.8456, -2.0]}
        zoom={2.5}
        className="w-full h-full"
      >
        <MapClusterLayer<AlumniProperties>
          data={geojson}
          clusterRadius={50}
          clusterMaxZoom={14}
          clusterColors={["#10b981", "#3b82f6", "#f59e0b"]} // emerald, blue, amber
          pointColor="#10b981"
          onPointClick={(feature, coordinates) => {
            setSelectedPoint({
              coordinates,
              properties: feature.properties,
            });
          }}
        />

        {selectedPoint && (
          <MapPopup
            longitude={selectedPoint.coordinates[0]}
            latitude={selectedPoint.coordinates[1]}
            onClose={() => setSelectedPoint(null)}
            closeButton
            className="w-48"
          >
            <div className="p-1 space-y-2">
              <p className="text-[12px] font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {selectedPoint.properties.name.split(',')[0]}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-zinc-500">
                  <span className="text-emerald-500 font-black">{selectedPoint.properties.count}</span> Alumni
                </p>
              </div>
            </div>
          </MapPopup>
        )}

        <MapControls 
          showZoom 
          showCompass 
          showFullscreen 
          position="bottom-left" 
          className="mb-8 ml-8"
        />
      </Map>
    </div>
  )
}
