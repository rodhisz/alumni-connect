"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage, useTheme } from "./Providers"
import { useSession } from "next-auth/react"
import { Moon, Sun, LogIn, Globe, User } from "lucide-react"

export default function HomeNavbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed top-0 w-full left-0 p-6 flex justify-between items-center glass z-50">
      <h1 className="font-outfit text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        Alumni Connect
      </h1>
      
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all"
        >
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <Globe size={20} />
          <span className="text-xs font-bold uppercase">{lang}</span>
        </button>

        <Link 
          href="/admin" 
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 truncate max-w-[200px]"
        >
          {(mounted && session) ? (
            <>
              <User size={18} />
              <span className="truncate">{session.user?.name || "User"}</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>{lang === "id" ? "Masuk Portal" : "Login Portal"}</span>
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
