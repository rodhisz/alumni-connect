"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage, useTheme } from "./Providers"
import { useSession, signOut } from "next-auth/react"
import { Moon, Sun, LogIn, Globe, User, LogOut } from "lucide-react"

export default function HomeNavbar({ settings = {} }: { settings?: Record<string, string> }) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === "dark"

  useEffect(() => { setMounted(true) }, [])

  const appName = settings["home_app_name"] || "Alumni Connect"
  const logoUrl  = settings["alumni_logo"] || settings["school_logo"]

  return (
    <div className="fixed top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 max-w-7xl mx-auto px-4 py-2.5 md:px-6 md:py-4 flex justify-between items-center glass rounded-2xl md:rounded-[2rem] z-50 shadow-xl md:shadow-2xl">
      <div className="flex items-center gap-3">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-0.5"
            onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        )}
        <h1 className="hidden sm:block font-outfit text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          {appName}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all"
        >
          {isDark ? <Sun size={18} className="text-amber-400 md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5 md:gap-2"
        >
          <Globe size={18} className="md:w-5 md:h-5" />
          <span className="text-[10px] md:text-xs font-bold uppercase">{lang}</span>
        </button>

        {mounted && session ? (
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 truncate max-w-[180px]"
            >
              <User size={18} className="text-emerald-500" />
              <span className="truncate">{session.user?.name || "User"}</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group"
              title={t("logout")}
            >
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <LogIn size={18} />
            <span>{lang === "id" ? "Masuk Portal" : "Login Portal"}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
