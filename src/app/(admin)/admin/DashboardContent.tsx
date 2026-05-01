"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/Providers"
import { Users, Clock, Database, MapPin, LayoutDashboard, UserCheck, Loader2, Hash, Table2, BarChart2, PieChart, RefreshCw, AlertCircle } from "lucide-react"
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

type Widget = {
  id: string
  name: string
  description?: string
  useRawQuery: boolean
  sqlQuery?: string
  chartType: "number" | "table" | "bar" | "pie"
  color: string
  colSpan: number
}

const CHART_ICONS = {
  number: Hash,
  table: Table2,
  bar: BarChart2,
  pie: PieChart,
}

const colorClass = (c: string) => ({
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
}[c] ?? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20")

const colSpanClass = (n: number) => ["col-span-1", "col-span-2", "col-span-3", "col-span-4"][n - 1] ?? "col-span-1"

function CustomWidgetCard({ widget }: { widget: Widget }) {
  const [data, setData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard-widgets/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetId: widget.id }),
      })
      const json = await res.json()
      if (json.error) setError(json.error)
      else setData(json.data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const Icon = CHART_ICONS[widget.chartType] || Hash

  return (
    <div className={`glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 ${colSpanClass(widget.colSpan)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${colorClass(widget.color)}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{widget.name}</p>
            {widget.description && <p className="text-[10px] text-zinc-500 truncate">{widget.description}</p>}
          </div>
        </div>
        <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[60px]">
        {loading ? (
          <Loader2 className="animate-spin text-zinc-300" size={24} />
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 text-xs font-mono">
            <AlertCircle size={14} /> Error
          </div>
        ) : widget.chartType === "number" ? (
          <p className="text-4xl font-outfit font-black text-zinc-900 dark:text-white">
            {data && data[0] ? String(Object.values(data[0])[0]) : "0"}
          </p>
        ) : widget.chartType === "table" ? (
           <div className="w-full overflow-auto max-h-40 text-[10px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    {data && data[0] && Object.keys(data[0]).map(k => <th key={k} className="px-2 py-1 text-left text-zinc-500 font-bold uppercase">{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data?.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-50 dark:border-zinc-900/50">
                      {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1 text-zinc-700 dark:text-zinc-300">{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        ) : (
          <p className="text-zinc-400 text-xs italic">Chart display pending</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardContent({ stats, isAdmin, userName, role }: DashboardStatsProps) {
  const { t } = useLanguage()
  const [customWidgets, setCustomWidgets] = useState<Widget[]>([])
  const { totalAlumni, pendingApprovals, totalMasterData, domestic } = stats

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/dashboard-widgets")
        .then(r => r.json())
        .then(data => setCustomWidgets(Array.isArray(data) ? data : []))
    }
  }, [isAdmin])

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("dashboard")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {t("quick_stats")} · Alumni Connect
          </p>
        </div>

        {isAdmin ? (
          <div className="space-y-8">
            {/* Standard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("total_alumni")}</p>
                  <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{totalAlumni}</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("pending_approvals")}</p>
                  <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{pendingApprovals}</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-4 bg-teal-100 text-teal-600 rounded-2xl dark:bg-teal-900/30 dark:text-teal-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("domestic_count")}</p>
                  <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{domestic}</p>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-2xl dark:bg-green-900/30 dark:text-green-400">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{t("master_data")}</p>
                  <p className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">{totalMasterData}</p>
                </div>
              </div>
            </div>

            {/* Custom Widgets Section */}
            {customWidgets.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-outfit font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                   <LayoutDashboard size={18} className="text-emerald-500" /> Custom Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {customWidgets.map(w => <CustomWidgetCard key={w.id} widget={w} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <LayoutDashboard size={200} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-outfit font-bold mb-4">
                {t("dashboard")}, {userName}! 👋
              </h2>
              <p className="text-emerald-50 text-lg leading-relaxed mb-8 opacity-90">
                {t("data_pending_notice")}
              </p>
              <div className="flex gap-4">
                <Link href="/admin/profile" className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:scale-[1.03] transition-transform shadow-xl flex items-center gap-2">
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
