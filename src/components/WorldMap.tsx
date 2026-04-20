"use client"

import React, { memo } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps"
import { useLanguage } from "./Providers"

// The topojson downloaded from world-atlas
const geoUrl = "/features.json"

type MapData = { name: string, count: number }

const coordinateDictionary: Record<string, [number, number]> = {
  // Indonesia Provinces
  "DKI Jakarta, Indonesia": [106.8456, -6.2088],
  "Jawa Barat, Indonesia": [107.6191, -6.9175],
  "Jawa Tengah, Indonesia": [110.4225, -6.9697],
  "Jawa Timur, Indonesia": [112.7521, -7.2504],
  "Banten, Indonesia": [106.1090, -6.1200],
  "Bali, Indonesia": [115.1889, -8.4095],
  "Sumatera Utara, Indonesia": [98.6722, 3.5952],
  "Aceh, Indonesia": [96.7491, 4.6951],
  "Sulawesi Selatan, Indonesia": [119.4327, -5.1476],
  "Kalimantan Timur, Indonesia": [117.1533, -0.4948],
  // Common States/Countries
  "Tokyo, Japan": [139.6917, 35.6895],
  "New York, USA": [-74.0060, 40.7128],
  "London, UK": [-0.1276, 51.5074],
  "Sydney, Australia": [151.2093, -33.8688],
  "Selangor, Malaysia": [101.5183, 3.0738],
}

// Fallback random cluster generator based on string
const getDeterministicCoord = (str: string): [number, number] => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  // If it's an Indonesian location but not in dictionary, land it somewhere in the archipelago
  if (str.includes(", Indonesia")) {
    // Indonesia bounds roughly: Lon 95 to 141, Lat -11 to 6
    const lon = 95 + (Math.abs(hash) % 46)
    const lat = -11 + (Math.abs(hash >> 8) % 17)
    return [lon, lat]
  }

  // Rough fallback spanning mostly asia/europe/us
  const lon = (hash % 180) 
  const lat = ((hash >> 8) % 60)
  return [lon, lat]
}

const MapChart = ({ data = [] }: { data?: MapData[] }) => {
  const { lang } = useLanguage()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const mapPoints = data.map(d => ({
    name: d.name,
    count: d.count,
    coordinates: coordinateDictionary[d.name] || getDeterministicCoord(d.name)
  }))

  if (!isMounted) return <div className="w-full h-[400px] bg-blue-500/5 animate-pulse rounded-3xl" />

  return (
    <div className="w-full h-full bg-blue-500/5 dark:bg-white/5 rounded-3xl overflow-hidden relative">
      <div className="absolute inset-x-0 top-6 text-center z-10 pointer-events-none">
        <h3 className="font-outfit font-bold text-zinc-800 dark:text-white text-lg drop-shadow-sm">
          {lang === "id" ? "Persebaran Alumni Global" : "Global Alumni Distribution"}
        </h3>
        <p className="text-xs text-zinc-500 font-medium">
          {lang === "id" ? "Berdasarkan Domisili Utama Terdaftar" : "Based on Registered Primary Domicile"}
        </p>
      </div>

      <ComposableMap
        projectionConfig={{
          scale: 140,
          rotation: [-11, 0, 0],
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={[0, 10]} zoom={1} minZoom={1} maxZoom={5}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E4E4E7" // zinc-200
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      fill: "currentColor",
                      color: "rgba(161, 161, 170, 0.4)", // zinc-400 with opacity
                      outline: "none",
                    },
                    hover: {
                      fill: "#3B82F6", // blue-500
                      outline: "none",
                    },
                    pressed: {
                      fill: "#2563EB", // blue-600
                      outline: "none",
                    },
                  }}
                  className="transition-colors dark:text-zinc-800"
                />
              ))
            }
          </Geographies>

          {mapPoints.map(({ name, coordinates, count }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle r={count > 500 ? 5 : count > 100 ? 3.5 : 2} fill="#3B82F6" className="animate-pulse" />
              <circle r={count > 500 ? 8 : count > 100 ? 6 : 4} fill="#3B82F6" opacity={0.3} className="animate-ping" />
              <text textAnchor="middle" y={-10} style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "10px", fontWeight: "bold" }}>
                {name.split(',')[0]} ({count})
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}

export default memo(MapChart)
