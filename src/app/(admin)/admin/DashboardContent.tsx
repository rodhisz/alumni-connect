"use client"

import { useLanguage } from "@/components/Providers"
import { Users, Clock, Database, MapPin, LayoutDashboard, UserCheck } from "lucide-react"
import Link from "next/link"

interface DashboardStatsProps {
  stats: {
    totalAlumni: number
    pendingApprovals: number
    totalMasterData: number
    domestic: number
  }
  isAdmin: boolean
  userName?: string
  role: string
}

export default function DashboardContent({ stats, isAdmin, userName, role }: DashboardStatsProps) {
  const { t } = useLanguage()
  const { totalAlumni, pendingApprovals, totalMasterData, domestic } = stats

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("dashboard")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {t("quick_stats")} · Alumni Connect
          </p>
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl dark:bg-blue-900/30 dark:text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("total_alumni")}</p>
                <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{totalAlumni}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl dark:bg-orange-900/30 dark:text-orange-400">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("pending_approvals")}</p>
                <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{pendingApprovals}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-4 bg-rose-100 text-rose-600 rounded-2xl dark:bg-rose-900/30 dark:text-rose-400">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("domestic")}</p>
                <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{domestic}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl dark:bg-emerald-900/30 dark:text-emerald-400">
                <Database size={24} />
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("master_data")}</p>
                <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{totalMasterData}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <LayoutDashboard size={200} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-outfit font-bold mb-4">
                {t("dashboard")}, {userName}! 👋
              </h2>
              <p className="text-blue-50 text-lg leading-relaxed mb-8 opacity-90">
                {t("data_pending_notice")}
              </p>
              <div className="flex gap-4">
                <Link href="/admin/profile" className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:scale-[1.03] transition-transform shadow-xl flex items-center gap-2">
                  <UserCheck size={20} /> {t("edit_profile")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
