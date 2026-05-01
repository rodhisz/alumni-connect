"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Globe, 
  MapPin, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  LayoutDashboard,
  Trophy,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react"
import WorldMap from "./WorldMap"
import Link from "next/link"
import { useLanguage } from "./Providers"

const countryToCode: Record<string, string> = {
  "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Andorra": "ad", "Angola": "ao", "Argentina": "ar", "Armenia": "am", "Australia": "au", "Austria": "at", "Azerbaijan": "az",
  "Bahamas": "bs", "Bahrain": "bh", "Bangladesh": "bd", "Barbados": "bb", "Belarus": "by", "Belgium": "be", "Belize": "bz", "Benin": "bj", "Bhutan": "bt", "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba", "Botswana": "bw", "Brazil": "br", "Brunei": "bn", "Bulgaria": "bg", "Burkina Faso": "bf", "Burundi": "bi", "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca",
  "Cape Verde": "cv", "Central African Republic": "cf", "Chad": "td", "Chile": "cl", "China": "cn", "Colombia": "co", "Comoros": "km", "Congo": "cg", "Costa Rica": "cr", "Croatia": "hr",
  "Cuba": "cu", "Cyprus": "cy", "Czech Republic": "cz", "Denmark": "dk", "Djibouti": "dj", "Dominica": "dm", "Dominican Republic": "do", "Ecuador": "ec", "Egypt": "eg", "El Salvador": "sv",
  "Equatorial Guinea": "gq", "Eritrea": "er", "Estonia": "ee", "Ethiopia": "et", "Fiji": "fj", "Finland": "fi", "France": "fr", "Gabon": "ga", "Gambia": "gm", "Georgia": "ge",
  "Germany": "de", "Ghana": "gh", "Greece": "gr", "Grenada": "gd", "Guatemala": "gt", "Guinea": "gn", "Guinea-Bissau": "gw", "Guyana": "gy", "Haiti": "ht", "Honduras": "hn",
  "Hungary": "hu", "Iceland": "is", "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq", "Ireland": "ie", "Israel": "il", "Italy": "it", "Jamaica": "jm",
  "Japan": "jp", "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke", "Kiribati": "ki", "Kuwait": "kw", "Kyrgyzstan": "kg", "Laos": "la", "Latvia": "lv", "Lebanon": "lb",
  "Lesotho": "ls", "Liberia": "lr", "Libya": "ly", "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu", "Macedonia": "mk", "Madagascar": "mg", "Malawi": "mw", "Malaysia": "my",
  "Maldives": "mv", "Mali": "ml", "Malta": "mt", "Marshall Islands": "mh", "Mauritania": "mr", "Mauritius": "mu", "Mexico": "mx", "Micronesia": "fm", "Moldova": "md", "Monaco": "mc",
  "Mongolia": "mn", "Montenegro": "me", "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm", "Namibia": "na", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz",
  "Nicaragua": "ni", "Niger": "ne", "Nigeria": "ng", "North Korea": "kp", "Norway": "no", "Oman": "om", "Pakistan": "pk", "Palau": "pw", "Panama": "pa", "Papua New Guinea": "pg",
  "Paraguay": "py", "Peru": "pe", "Philippines": "ph", "Poland": "pl", "Portugal": "pt", "Qatar": "qa", "Romania": "ro", "Russia": "ru", "Rwanda": "rw", "Saint Kitts and Nevis": "kn",
  "Saint Lucia": "lc", "Saint Vincent and the Grenadines": "vc", "Samoa": "ws", "San Marino": "sm", "Sao Tome and Principe": "st", "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs", "Seychelles": "sc", "Sierra Leone": "sl",
  "Singapore": "sg", "Slovakia": "sk", "Slovenia": "si", "Solomon Islands": "sb", "Somalia": "so", "South Africa": "za", "South Korea": "kr", "South Sudan": "ss", "Spain": "es", "Sri Lanka": "lk",
  "Sudan": "sd", "Suriname": "sr", "Swaziland": "sz", "Sweden": "se", "Switzerland": "ch", "Syria": "sy", "Taiwan": "tw", "Tajikistan": "tj", "Tanzania": "tz", "Thailand": "th",
  "Timor-Leste": "tl", "Togo": "tg", "Tonga": "to", "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", "Turkmenistan": "tm", "Tuvalu": "tv", "Uganda": "ug", "Ukraine": "ua",
  "United Arab Emirates": "ae", "United Kingdom": "gb", "United States": "us", "Uruguay": "uy", "Uzbekistan": "uz", "Vanuatu": "vu", "Vatican City": "va", "Venezuela": "ve", "Vietnam": "vn", "Yemen": "ye",
  "Zambia": "zm", "Zimbabwe": "zw",
  "USA": "us", "UK": "gb"
}

interface Distribution {
  name: string
  count: number
}

interface LandingContentProps {
  stats: any
  mapData: any[]
  news: any[]
  settings: any
  widgets: any[]
  distributions: {
    domestic: Distribution[]
    international: Distribution[]
  }
}

export default function LandingContent({ stats, mapData, news = [], settings = {}, widgets = [], distributions }: LandingContentProps) {
  const [distType, setDistType] = useState<"domestic" | "international">("domestic")
  const { lang, t } = useLanguage()
  
  const currentDist = useMemo(() => {
    const list = (distType === "domestic" ? distributions?.domestic : distributions?.international) || []
    return [...list].sort((a, b) => b.count - a.count)
  }, [distType, distributions])

  const top5 = useMemo(() => currentDist.slice(0, 5), [currentDist])
  const others = useMemo(() => currentDist.slice(5), [currentDist])
  const maxCount = useMemo(() => (currentDist.length > 0 ? currentDist[0].count : 1), [currentDist])

  const appName = settings.home_app_name || settings.site_name || "Alumni Connect"

  return (
    <div className="space-y-32 pb-20 overflow-x-hidden">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative pt-10 pb-10">
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm mx-auto"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Platform {appName}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
          >
            {lang === "id" ? (settings.home_hero_title || "Menghubungkan") : (settings.home_hero_title_en || "Connecting")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              {lang === "id" ? (settings.home_hero_subtitle || "Lintas Generasi.") : (settings.home_hero_subtitle_en || "Generations.")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {lang === "id" 
              ? (settings.home_hero_desc || "Wadah resmi untuk mempererat tali silaturahmi, berbagi peluang karir, dan membangun jaringan profesional alumni yang tangguh.") 
              : (settings.home_hero_desc_en || "Official platform to strengthen relationships, share career opportunities, and build a strong professional alumni network.")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/aktivasi" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 group">
              {t("account_activation")} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 glass hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl font-black transition-all active:scale-95">
              {lang === "id" ? "Masuk ke Akun" : "Sign In"}
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ── Custom Widgets (Dynamic Stats) ────────────────────────── */}
      {widgets && widgets.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">{t("quick_stats")}</span>
              <h2 className="text-4xl font-black">{lang === "id" ? "Wawasan Jaringan Alumni" : "Alumni Network Insights"}</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {widgets.map((widget, idx) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass p-8 rounded-[2rem] border-emerald-500/5 hover:border-emerald-500/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp size={60} className="text-emerald-500" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:rotate-12 transition-transform">
                    {idx % 2 === 0 ? <Users size={24} /> : <Globe size={24} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                      {typeof widget.value === 'number' ? widget.value.toLocaleString() : widget.value}
                    </p>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{widget.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Geographic & Distribution Section ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 space-y-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">{lang === "id" ? "Jangkauan Geografis" : "Geographic Coverage"}</span>
            <h2 className="text-5xl lg:text-6xl font-black leading-tight">{t("global_distribution")}.</h2>
          </div>

          <div className="glass p-1.5 rounded-2xl flex gap-1 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => setDistType("domestic")}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                distType === "domestic" 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {t("domestic")}
            </button>
            <button
              onClick={() => setDistType("international")}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${
                distType === "international" 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {t("foreign")}
            </button>
          </div>
        </div>

        {/* Huge World Map at the top of Geographic section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative w-full aspect-[2/1] lg:aspect-[3/1] rounded-[4rem] border border-emerald-500/10 p-2 shadow-2xl overflow-hidden glass"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full" />
          <WorldMap data={mapData} />
        </motion.div>

        {/* Distribution List below Map */}
        <div className="glass rounded-[4rem] p-8 lg:p-14 border-emerald-500/5 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-20">
            {/* Top 5 Section */}
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <Trophy size={24} />
                </div>
                <h3 className="text-2xl font-black">{lang === "id" ? "Wilayah Teratas" : "Top Performing Regions"}</h3>
              </div>
              <div className="space-y-8">
                {top5.map((item, idx) => (
                  <motion.div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-500/10">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-4">
                          {distType === "international" && (
                            <img 
                              src={`https://flagcdn.com/w40/${countryToCode[item.name] || 'id'}.png`}
                              alt={item.name}
                              className="w-7 h-5 rounded-sm object-cover shadow-md"
                            />
                          )}
                          <p className="font-black text-xl group-hover:text-emerald-500 transition-colors">{item.name}</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{item.count}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Alumni</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.count / maxCount) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Others Section (Scrollable) */}
            <div className="space-y-10 flex flex-col h-full">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-zinc-500/10 rounded-xl text-zinc-500">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="text-2xl font-black">{lang === "id" ? "Wilayah Lainnya" : "Other Regions"}</h3>
              </div>
              
              <div className="relative flex-grow">
                <div className="max-h-[400px] overflow-y-auto pr-6 space-y-4 custom-scrollbar">
                  {others.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all group">
                      <div className="flex items-center gap-4">
                        {distType === "international" ? (
                          <img 
                            src={`https://flagcdn.com/w40/${countryToCode[item.name] || 'id'}.png`}
                            alt={item.name}
                            className="w-6 h-4 rounded-sm object-cover"
                          />
                        ) : (
                          <MapPin size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        )}
                        <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">{item.name}</p>
                      </div>
                      <p className="text-base font-black text-zinc-900 dark:text-white">{item.count}</p>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── News Section ────────────────────────────────── */}
      {news && news.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-6 space-y-12">
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">{t("news")}</span>
              <h2 className="text-4xl font-black">{t("latest_news")} {appName}</h2>
            </div>
            <Link href="/news" className="group flex items-center gap-2 text-sm font-black text-emerald-500 hover:text-emerald-600 transition-all">
              {t("all_news")} <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {news.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative glass rounded-[3rem] overflow-hidden border-emerald-500/5 hover:border-emerald-500/20 transition-all flex flex-col h-full shadow-lg"
              >
                <div className="aspect-[16/11] overflow-hidden relative">
                  <img 
                    src={item.image || `https://images.unsplash.com/photo-1523050853063-913ced9fbf74?q=80&w=800&auto=format&fit=crop`} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 flex items-center gap-6 text-white/90 text-[11px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={14} className="text-emerald-400" />
                      {new Date(item.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User size={14} className="text-emerald-400" />
                      {item.author?.name || "Official"}
                    </div>
                  </div>
                </div>
                <div className="p-10 space-y-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-black leading-tight group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-base line-clamp-3 leading-relaxed flex-grow font-medium">
                    {item.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...'}
                  </p>
                  <Link href={`/news/${item.slug || item.id}`} className="inline-flex items-center gap-2 text-sm font-black text-emerald-500 uppercase tracking-widest pt-4 group/btn">
                    {t("read_more")} <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* ── About Us Section ────────────────────────────────────────── */}
      {(settings.about_us_title || settings.about_us_content) && (
        <section className="max-w-7xl mx-auto w-full px-6 space-y-12">
          <div className="glass p-12 lg:p-20 rounded-[4rem] border-emerald-500/5 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Logo Kiri (2/4) */}
              <div className="flex justify-center md:justify-start">
                {settings.alumni_logo ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-white rounded-[3rem] shadow-xl border border-zinc-100 dark:border-zinc-800 p-6 overflow-hidden flex items-center justify-center"
                  >
                    <img 
                      src={settings.alumni_logo} 
                      alt="Logo Ikatan Alumni" 
                      className="w-full h-full object-contain drop-shadow-sm"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </motion.div>
                ) : (
                  <div className="w-full aspect-square max-w-[320px] rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center">
                    <span className="text-emerald-500 font-bold opacity-50">Logo Alumni</span>
                  </div>
                )}
              </div>
              
              {/* Penjelasan Kanan (2/4) */}
              <div className="space-y-6 text-center md:text-left">
                {settings.about_us_title && (
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500">
                      {lang === "id" ? "Tentang Kami" : "About Us"}
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-black leading-tight text-zinc-900 dark:text-white">
                      {settings.about_us_title}
                    </h2>
                  </div>
                )}
                {settings.about_us_content && (
                  <p className="text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {settings.about_us_content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer CTA ────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6">
        <div className="relative glass p-16 lg:p-24 rounded-[5rem] border-emerald-500/10 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h4 className="text-lg font-black text-emerald-500 tracking-widest uppercase">{appName}</h4>
                <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95]">
                  {lang === "id" ? "Perluas" : "Expand"} <br /> {lang === "id" ? "Jaringan Anda." : "Your Network."}
                </h2>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xl leading-relaxed max-w-md font-medium">
                {lang === "id" ? "Aktivasi akun Anda sekarang untuk mengakses fitur eksklusif alumni dan terhubung dengan rekan sejawat." : "Activate your account now to access exclusive alumni features and connect with your peers."}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/aktivasi" className="px-12 py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-emerald-500/40 active:scale-95">
                  {t("account_activation")}
                </Link>
              </div>
            </div>

            <div className="space-y-12 lg:pl-16 lg:border-l border-zinc-200 dark:border-zinc-800">
              <div className="space-y-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    {settings.school_logo && (
                      <img src={settings.school_logo} alt="School Logo" className="w-8 h-8 object-contain" />
                    )}
                    <h4 className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500">{lang === "id" ? "Kontak Sekolah" : "School Contact"}</h4>
                  </div>
                  <div className="space-y-6">
                    {settings.school_address && (
                      <div className="flex items-start gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <MapPin size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("address")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200 leading-relaxed">
                            {settings.school_address}
                          </p>
                        </div>
                      </div>
                    )}
                    {settings.school_email && (
                      <div className="flex items-center gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <Mail size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("email")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200">{settings.school_email}</p>
                        </div>
                      </div>
                    )}
                    {settings.school_phone && (
                      <div className="flex items-center gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <Phone size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("phone_number")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200">{settings.school_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    {settings.alumni_logo && (
                      <img src={settings.alumni_logo} alt="Alumni Logo" className="w-8 h-8 object-contain" />
                    )}
                    <h4 className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500">{lang === "id" ? "Kontak Ikatan Alumni" : "Alumni Contact"}</h4>
                  </div>
                  <div className="space-y-6">
                    {settings.alumni_address && (
                      <div className="flex items-start gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <MapPin size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("address")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200 leading-relaxed">
                            {settings.alumni_address}
                          </p>
                        </div>
                      </div>
                    )}
                    {settings.alumni_email && (
                      <div className="flex items-center gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <Mail size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("email")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200">{settings.alumni_email}</p>
                        </div>
                      </div>
                    )}
                    {settings.alumni_phone && (
                      <div className="flex items-center gap-6 group">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                          <Phone size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">{t("phone_number")}</p>
                          <p className="text-base font-bold text-zinc-700 dark:text-zinc-200">{settings.alumni_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  )
}
