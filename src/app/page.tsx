import HomeNavbar from '@/components/HomeNavbar'
import LandingContent from '@/components/LandingContent'
import prisma from '@/lib/prisma'
import { generateSqlFromBuilder } from '@/lib/widget-engine'

export const dynamic = "force-dynamic"

export default async function Home() {
  const [totalAlumni, totalMasterData, domestic, profiles, latestNews, rawSettings, rawWidgets] = await Promise.all([
    prisma.alumniProfile.count({ where: { status: "APPROVED" } }),
    prisma.masterData.count({ where: { isActive: true } }),
    prisma.alumniProfile.count({ where: { domicileType: "DOMESTIC", status: "APPROVED" } }),
    prisma.alumniProfile.findMany({
      where: { status: "APPROVED" },
      include: { 
        province: { select: { latitude: true, longitude: true } },
        country: { select: { latitude: true, longitude: true } }
      },
    }),
    prisma.news.findMany({
      where: { isPublished: true },
      take: 9,
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.siteSetting.findMany(),
    prisma.dashboardWidget.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ])

  // Execute SQL for each widget to get dynamic values
  const widgets = await Promise.all(rawWidgets.map(async (w) => {
    try {
      const query = w.useRawQuery ? w.sqlQuery : generateSqlFromBuilder(w.builderConfig as any)
      if (!query) return { ...w, value: 0 }
      
      const result: any[] = await prisma.$queryRawUnsafe(query)
      return {
        ...w,
        value: result[0]?.value ?? 0
      }
    } catch (e) {
      console.error(`Error executing widget query for ${w.name}:`, e)
      return { ...w, value: 0 }
    }
  }))

  // Build settings map
  const settings: Record<string, string> = {}
  for (const s of (rawSettings ?? [])) {
    settings[s.key] = s.value ?? ""
  }

  const domesticDist: Record<string, number> = {}
  const foreignDist: Record<string, number> = {}

  function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  const locationData: Record<string, { count: number, coords: [number, number] | null }> = {}

  profiles.forEach(p => {
    let mapLoc = null
    let coords: [number, number] | null = null

    if (p.domicileType === "DOMESTIC" && p.provinceName) {
      const provinceTitle = toTitleCase(p.provinceName);
      mapLoc = provinceTitle + ", Indonesia"
      domesticDist[provinceTitle] = (domesticDist[provinceTitle] || 0) + 1
      
      // Use Province coords only
      if (p.province?.latitude && p.province?.longitude) {
        coords = [p.province.longitude, p.province.latitude]
      }
    } else if (p.domicileType === "FOREIGN" && p.countryName) {
      const countryTitle = toTitleCase(p.countryName);
      mapLoc = countryTitle
      foreignDist[countryTitle] = (foreignDist[countryTitle] || 0) + 1
      
      // Use Country coords only
      if (p.country?.latitude && p.country?.longitude) {
        coords = [p.country.longitude, p.country.latitude]
      }
    }

    if (mapLoc) {
      if (!locationData[mapLoc]) {
        locationData[mapLoc] = { count: 0, coords: coords }
      }
      locationData[mapLoc].count += 1
      // Update coordinates if previously null but now available
      if (!locationData[mapLoc].coords && coords) {
        locationData[mapLoc].coords = coords
      }
    }
  })

  const domesticDistribution = Object.entries(domesticDist).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  const foreignDistribution = Object.entries(foreignDist).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  const mapData = Object.entries(locationData).map(([name, data]) => ({ 
    name, 
    count: data.count, 
    coordinates: data.coords 
  }))

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 pt-24">
      <HomeNavbar settings={settings} />
      <LandingContent
        stats={{ totalAlumni, locationsReached: domesticDistribution.length + foreignDistribution.length, totalMasterData, domestic }}
        mapData={mapData}
        news={latestNews}
        settings={settings}
        widgets={widgets}
        distributions={{ domestic: domesticDistribution, international: foreignDistribution }}
      />
    </main>
  )
}
