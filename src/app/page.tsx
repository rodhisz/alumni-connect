import HomeNavbar from '@/components/HomeNavbar'
import LandingContent from '@/components/LandingContent'
import prisma from '@/lib/prisma'

export const dynamic = "force-dynamic"

export default async function Home() {
  // Fetch statistics
  // Fetch statistics and latest news
  const [totalAlumni, pendingApprovals, totalMasterData, domestic, profiles, latestNews] = await Promise.all([
    prisma.alumniProfile.count({ where: { status: "APPROVED" } }),
    prisma.profileRevision.count({ where: { status: "WAITING" } }),
    prisma.masterData.count({ where: { isActive: true } }),
    prisma.alumniProfile.count({ where: { domicileType: "DOMESTIC", status: "APPROVED" } }),
    prisma.alumniProfile.findMany({ where: { status: "APPROVED" } }),
    (prisma as any).news?.findMany({
      where: { isPublished: true },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } }
    }) || []
  ])

  const locationCounts: Record<string, number> = {}
  
  profiles.forEach(p => {
    let loc = null
    if (p.domicileType === "DOMESTIC" && p.provinceName) {
      loc = p.provinceName + ", Indonesia"
    } else if (p.domicileType === "FOREIGN" && p.stateName) {
      loc = p.stateName + ", " + (p.countryName || "Luar Negeri")
    }

    if (loc) {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1
    }
  })

  const mapData = Object.entries(locationCounts).map(([name, count]) => ({
    name, count
  }))

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 pt-24">
      <HomeNavbar />
      <LandingContent 
        stats={{ totalAlumni, pendingApprovals, totalMasterData, domestic }}
        mapData={mapData}
        news={latestNews}
      />
    </main>
  )
}
