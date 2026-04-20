"use client"

import { useLanguage } from "./Providers"
import { Users, Clock, Database, MapPin, Target, ShieldCheck, Map as MapIcon } from "lucide-react"
import WorldMap from "./WorldMap"
import Link from "next/link"

interface LandingContentProps {
  stats: {
    totalAlumni: number
    pendingApprovals: number
    totalMasterData: number
    domestic: number
  }
  mapData: any[]
  news?: any[]
}

export default function LandingContent({ stats, mapData, news }: LandingContentProps) {
  const { t, lang } = useLanguage()

  const features = [
    { title: t("alumni_registered"), value: stats.totalAlumni, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: t("pending_approvals"), value: stats.pendingApprovals, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: t("domestic"), value: stats.domestic, icon: MapPin, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: t("master_data"), value: stats.totalMasterData, icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  const highlights = [
    { title: t("global_distribution"), subtitle: t("interactive_map"), icon: MapIcon, color: "text-green-500" },
    { title: t("verified_system"), subtitle: t("secure_100"), icon: ShieldCheck, color: "text-rose-500" },
    { title: t("alumni_activity"), subtitle: t("college_work"), icon: Target, color: "text-cyan-500" },
  ]

  return (
    <div className="flex flex-col space-y-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-12 space-y-8 max-w-4xl mx-auto px-6">
        <h2 className="font-outfit text-5xl md:text-7xl font-extrabold leading-tight">
          {t("hero_title")} <br/>
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            {t("hero_subtitle_gradient")}
          </span>
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl">
          {t("hero_description")}
        </p>

        <div className="flex gap-4 pt-8">
          <button className="px-8 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:scale-105 transition-transform shadow-xl">
            {t("explore_now")}
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-6">
        {features.map((feat, i) => (
          <div key={i} className="glass p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:scale-[1.02] transition-all duration-300">
            <div className={`p-4 rounded-2xl w-fit ${feat.bg} ${feat.color} mb-4`}>
              <feat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{feat.title}</p>
              <h3 className="font-outfit font-bold text-3xl text-zinc-900 dark:text-white">{feat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Latest News Section */}
      <section className="max-w-7xl mx-auto w-full px-6 space-y-12">
        <div className="flex items-end justify-between">
           <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">{t("latest_news")}</h2>
              <h3 className="text-4xl font-outfit font-black text-zinc-900 dark:text-white">{lang === 'id' ? "Info Alumni Terkini" : "Latest Alumni Insights"}</h3>
           </div>
           <Link href="/news" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
              {t("all_news")}
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news && news.length > 0 ? news.slice(0, 3).map((item, i) => (
                <Link href={`/news/${item.slug}`} key={i} className="group glass-premium rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                    <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                <MapIcon size={48} className="opacity-20" />
                            </div>
                        )}
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{item.author.name}</span>
                        </div>
                        <h4 className="text-xl font-outfit font-black text-zinc-900 dark:text-white leading-tight mb-4 group-hover:text-blue-500 transition-colors line-clamp-2">
                            {item.title}
                        </h4>
                    </div>
                </Link>
            )) : (
                <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500 font-bold">{t("no_data")}</p>
                </div>
            )}
        </div>
      </section>

      {/* Highlights & Map */}
      <section className="max-w-7xl mx-auto w-full px-6 space-y-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <div key={i} className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="font-outfit font-bold text-lg">{item.title}</h4>
                <p className="text-zinc-500 text-xs">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 glass rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative h-[500px]">
           <WorldMap data={mapData} />
        </div>
      </section>
    </div>
  )
}
