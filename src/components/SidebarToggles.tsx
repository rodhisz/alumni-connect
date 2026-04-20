"use client"

import { useLanguage, useTheme } from "./Providers"
import { Moon, Sun } from "lucide-react"

export default function SidebarToggles() {
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useLanguage()

  const isDark = theme === "dark"


  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
          isDark
            ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"
        }`}
        aria-label={isDark ? "Light Mode" : "Dark Mode"}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark
          ? <Sun size={18} className="text-amber-400" />
          : <Moon size={18} className="text-zinc-600" />
        }
      </button>

      {/* Language Toggle */}
      <button
        type="button"
        onClick={() => setLang(lang === "id" ? "en" : "id")}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer gap-1 ${
          isDark
            ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"
        }`}
        aria-label={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
        title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      >
        <span className="text-base leading-none select-none">
          {lang === "id" ? "🇮🇩" : "🇺🇸"}
        </span>
      </button>
    </div>
  )
}
