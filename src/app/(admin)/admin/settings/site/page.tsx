"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/Providers"
import {
  School, Image as ImageIcon, Globe, MapPin, Type, FileText,
  Save, CheckCircle, AlertCircle, Loader2, ExternalLink
} from "lucide-react"

const SETTING_KEYS = [
  // Theme & Colors
  { key: "theme_color",           label: "Warna Utama",         icon: ImageIcon, type: "color", section: "theme" },
  { key: "theme_color_secondary", label: "Warna Sekunder (Gradasi)", icon: ImageIcon, type: "color", section: "theme" },
  // School info
  { key: "school_name",    label: "Nama Sekolah",      icon: School,     type: "text",  section: "school" },
  { key: "school_tagline", label: "Tagline",            icon: Type,       type: "text",  section: "school" },
  { key: "school_address", label: "Alamat Sekolah",     icon: MapPin,     type: "textarea", section: "school" },
  { key: "school_email",   label: "Email Sekolah",      icon: Globe,      type: "text",  section: "school" },
  { key: "school_phone",   label: "Telepon Sekolah",    icon: Globe,      type: "text",  section: "school" },
  { key: "school_website", label: "Website URL",        icon: Globe,      type: "url",   section: "school" },
  { key: "school_logo",    label: "Logo URL",           icon: ImageIcon,  type: "url",   section: "school" },
  // Alumni Contact
  { key: "alumni_logo",    label: "Logo Ikatan Alumni (URL)", icon: ImageIcon, type: "url", section: "alumni" },
  { key: "alumni_address", label: "Alamat Ikatan Alumni", icon: MapPin,     type: "textarea", section: "alumni" },
  { key: "alumni_email",   label: "Email Ikatan Alumni",  icon: Globe,      type: "text",  section: "alumni" },
  { key: "alumni_phone",   label: "Telepon Ikatan Alumni",icon: Globe,      type: "text",  section: "alumni" },
  // Home content
  { key: "home_hero_title",    label: "Judul Hero (ID)",     icon: FileText, type: "text", section: "home" },
  { key: "home_hero_subtitle", label: "Subtitle Gradient (ID)", icon: FileText, type: "text", section: "home" },
  { key: "home_hero_desc",     label: "Deskripsi Hero (ID)", icon: FileText, type: "textarea", section: "home" },
  { key: "home_hero_title_en",    label: "Judul Hero (EN)",     icon: FileText, type: "text", section: "home" },
  { key: "home_hero_subtitle_en", label: "Subtitle Gradient (EN)", icon: FileText, type: "text", section: "home" },
  { key: "home_hero_desc_en",     label: "Deskripsi Hero (EN)", icon: FileText, type: "textarea", section: "home" },
  { key: "home_app_name",  label: "Nama Aplikasi (Navbar)", icon: Type,    type: "text", section: "home" },
  { key: "about_us_title", label: "Judul Tentang Kami", icon: Type, type: "text", section: "home" },
  { key: "about_us_content", label: "Konten Tentang Kami", icon: FileText, type: "textarea", section: "home" },
]

type Status = "idle" | "saving" | "saved" | "error"

export default function SiteSettingsPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(true)

  const isSuperuser = (session?.user as any)?.role === "SUPERUSER"

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { setValues(data); setLoading(false) })
  }, [])

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setStatus("saving")
    setErrorMsg("")
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus("saved")
      // Auto reload to apply layout changes (e.g., theme colors)
      setTimeout(() => window.location.reload(), 1000)
    } catch (e: any) {
      setStatus("error")
      setErrorMsg(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    )
  }

  const themeFields  = SETTING_KEYS.filter(s => s.section === "theme")
  const schoolFields = SETTING_KEYS.filter(s => s.section === "school")
  const alumniFields = SETTING_KEYS.filter(s => s.section === "alumni")
  const homeFields   = SETTING_KEYS.filter(s => s.section === "home")

  const logoPreview = values["school_logo"]

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pengaturan Situs
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Konfigurasi info sekolah dan konten halaman utama
          </p>
        </div>

        {!isSuperuser && (
          <div className="glass p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-3">
            <AlertCircle size={18} />
            Hanya Superuser yang dapat mengubah pengaturan ini.
          </div>
        )}

        {/* Theme Info */}
        <section className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-lg text-zinc-900 dark:text-white">Tema & Warna</h2>
              <p className="text-xs text-zinc-500">Konfigurasi warna utama dan gradasi (default hijau: #10b981 & #2dd4bf)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themeFields.map(({ key, label, icon: Icon, type }) => (
              <div key={key} className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <Icon size={14} />
                  {label}
                </label>
                <div className="relative">
                  <input
                    type="color"
                    className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 cursor-pointer"
                    value={values[key] ?? (key === "theme_color" ? "#10b981" : "#2dd4bf")}
                    onChange={e => handleChange(key, e.target.value)}
                    disabled={!isSuperuser}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* School Info */}
        <section className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <School size={20} />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-lg text-zinc-900 dark:text-white">Info Sekolah</h2>
              <p className="text-xs text-zinc-500">Tampil di bagian bawah halaman utama</p>
            </div>
            {/* Logo preview */}
            {logoPreview && (
              <div className="ml-auto w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white flex items-center justify-center">
                <img src={logoPreview} alt="logo" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
              </div>
            )}
          </div>

          {schoolFields.map(({ key, label, icon: Icon, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <Icon size={14} />
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  rows={3}
                  value={values[key] ?? ""}
                  onChange={e => handleChange(key, e.target.value)}
                  disabled={!isSuperuser}
                />
              ) : (
                <div className="relative">
                  <input
                    type={type === "color" ? "color" : "text"}
                    className={`w-full ${type === 'color' ? 'h-12' : 'px-4 py-3'} rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50`}
                    value={values[key] ?? (type === "color" ? "#10b981" : "")}
                    onChange={e => handleChange(key, e.target.value)}
                    disabled={!isSuperuser}
                    placeholder={type === "url" ? "https://..." : ""}
                  />
                  {type === "url" && values[key] && (
                    <a href={values[key]} target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Alumni Info */}
        <section className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <School size={20} />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-lg text-zinc-900 dark:text-white">Info Ikatan Alumni</h2>
              <p className="text-xs text-zinc-500">Tampil terpisah dari kontak sekolah di bagian bawah halaman utama</p>
            </div>
          </div>

          {alumniFields.map(({ key, label, icon: Icon, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <Icon size={14} />
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  rows={3}
                  value={values[key] ?? ""}
                  onChange={e => handleChange(key, e.target.value)}
                  disabled={!isSuperuser}
                />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                    value={values[key] ?? ""}
                    onChange={e => handleChange(key, e.target.value)}
                    disabled={!isSuperuser}
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Home Content */}
        <section className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Type size={20} />
            </div>
            <div>
              <h2 className="font-outfit font-bold text-lg text-zinc-900 dark:text-white">Konten Halaman Utama</h2>
              <p className="text-xs text-zinc-500">Hero section & nama aplikasi di navbar</p>
            </div>
          </div>

          {homeFields.map(({ key, label, icon: Icon, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <Icon size={14} />
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  rows={3}
                  value={values[key] ?? ""}
                  onChange={e => handleChange(key, e.target.value)}
                  disabled={!isSuperuser}
                />
              ) : (
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  value={values[key] ?? ""}
                  onChange={e => handleChange(key, e.target.value)}
                  disabled={!isSuperuser}
                />
              )}
            </div>
          ))}
        </section>

        {/* Save */}
        {isSuperuser && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {status === "saving" ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
            {status === "saved" && (
              <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle size={16} /> Tersimpan!
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-2 text-red-500 font-bold text-sm">
                <AlertCircle size={16} /> {errorMsg || "Gagal menyimpan"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
