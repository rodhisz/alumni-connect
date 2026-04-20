"use client"

import Link from "next/link"
import { UserCircle, LogOut, Map } from "lucide-react"
import { useLanguage } from "./Providers"
import SidebarToggles from "./SidebarToggles"

interface PortalHeaderProps {
  session: any
}

export default function PortalHeader({ session }: PortalHeaderProps) {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="font-outfit font-bold">A</span>
          </div>
          <span className="font-outfit font-bold tracking-tight hidden sm:block">Alumni Connect</span>
        </Link>
        
        <div className="flex items-center gap-4 hidden sm:flex">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">{t("personal_data")}</Link>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">{t("network_map")}</Link>
        </div>

        <div className="flex items-center gap-4">
          <SidebarToggles />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
            <UserCircle size={18} className="text-zinc-500" />
            <span className="text-xs font-medium max-w-[120px] truncate">{session.user.name || session.user.email}</span>
          </div>
          <Link href="/api/auth/signout" className="text-zinc-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
