"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Plus, Trash2, Edit3, Play, X, Save,
  Loader2, CheckCircle, AlertCircle, ChevronDown, Database,
  BarChart2, PieChart, Hash, Table2, RefreshCw, GripVertical
} from "lucide-react"

import { generateSqlFromBuilder, type BuilderConfig, type BuilderFilter } from "@/lib/widget-engine"

type ChartType = "number" | "table" | "bar" | "pie"
type Widget = {
  id: string
  name: string
  description?: string
  useRawQuery: boolean
  sqlQuery?: string
  builderConfig?: BuilderConfig
  chartType: ChartType
  color: string
  colSpan: number
  order: number
  isActive: boolean
}

const BUILDER_ENTITIES = [
  { id: "AlumniProfile", label: "Alumni Profile" },
  { id: "User", label: "User" },
  { id: "News", label: "News / Berita" },
  { id: "MasterData", label: "Master Data" },
]

const ENTITY_FIELDS: Record<string, { id: string, label: string }[]> = {
  AlumniProfile: [
    { id: "status", label: "Status (APPROVED/PENDING)" },
    { id: "gender", label: "Jenis Kelamin" },
    { id: "graduationYear", label: "Tahun Lulus" },
    { id: "domicileType", label: "Domisili (DOMESTIC/FOREIGN)" },
    { id: "isDead", label: "Alumni Meninggal" },
  ],
  User: [
    { id: "role", label: "Role (SUPERUSER/ADMIN/ALUMNI)" },
    { id: "isActive", label: "Status Aktif" },
  ],
  News: [
    { id: "isPublished", label: "Status Terbit" },
    { id: "viewCount", label: "Jumlah View" },
  ],
  MasterData: [
    { id: "category", label: "Kategori" },
    { id: "isActive", label: "Status Aktif" },
  ],
}
const COLOR_OPTIONS = ["emerald", "blue", "violet", "amber", "rose", "cyan", "orange", "teal"]
const CHART_ICONS: Record<ChartType, React.ElementType> = {
  number: Hash,
  table: Table2,
  bar: BarChart2,
  pie: PieChart,
}

const colorClass = (c: string) => ({
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
}[c] ?? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20")

const colSpanClass = (n: number) => ["col-span-1", "col-span-2", "col-span-3", "col-span-4"][n - 1] ?? "col-span-1"

type WidgetResult = { data?: any[]; error?: string } | null

function WidgetPreview({ widget, result }: { widget: Partial<Widget>; result: WidgetResult }) {
  const Icon = CHART_ICONS[widget.chartType ?? "number"]

  if (!result) {
    return (
      <div className="h-24 flex items-center justify-center text-zinc-400 text-sm">
        Klik ▶ untuk preview
      </div>
    )
  }
  if (result.error) {
    return (
      <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-mono">
        {result.error}
      </div>
    )
  }

  const rows = result.data ?? []

  if (widget.chartType === "number") {
    const firstRow = rows[0]
    const val = firstRow ? Object.values(firstRow)[0] : "—"
    return (
      <div className={`p-4 rounded-2xl border ${colorClass(widget.color ?? "emerald")} flex items-center gap-4`}>
        <Icon size={28} />
        <div>
          <p className="text-3xl font-outfit font-black">{String(val)}</p>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">{widget.name || "Widget"}</p>
        </div>
      </div>
    )
  }

  if (widget.chartType === "table") {
    if (!rows.length) return <p className="text-zinc-400 text-sm">Tidak ada data</p>
    const cols = Object.keys(rows[0])
    return (
      <div className="overflow-auto max-h-48 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-xs">
          <thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
            <tr>{cols.map(c => <th key={c} className="px-3 py-2 text-left font-bold text-zinc-600 dark:text-zinc-300">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                {cols.map(c => <td key={c} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{String((row as any)[c] ?? "—")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return <p className="text-zinc-400 text-xs">Chart mode: {widget.chartType}</p>
}

const emptyWidget = (): Omit<Widget, "id" | "isActive"> => ({
  name: "",
  description: "",
  useRawQuery: false,
  builderConfig: {
    entity: "AlumniProfile",
    aggregation: "count",
    filters: [],
  },
  sqlQuery: "SELECT COUNT(*) as total FROM \"AlumniProfile\" WHERE status = 'APPROVED'",
  chartType: "number",
  color: "emerald",
  colSpan: 1,
  order: 0,
})

function WidgetForm({ initial, onSave, onCancel, isSaving }: {
  initial: Partial<Widget>
  onSave: (data: Partial<Widget>) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [form, setForm] = useState<Partial<Widget>>(initial)
  const [testResult, setTestResult] = useState<WidgetResult>(null)
  const [testing, setTesting] = useState(false)

  const set = (k: keyof Widget, v: any) => setForm(prev => ({ ...prev, [k]: v }))
  const setBC = (v: Partial<BuilderConfig>) => set("builderConfig", { ...form.builderConfig, ...v })

  const runTest = async () => {
    setTesting(true)
    setTestResult(null)
    const res = await fetch("/api/dashboard-widgets/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: form.useRawQuery ? form.sqlQuery : undefined,
        builderConfig: form.useRawQuery ? undefined : form.builderConfig 
      }),
    })
    const json = await res.json()
    setTestResult(json)
    setTesting(false)
  }

  const addFilter = () => {
    const filters = [...(form.builderConfig?.filters || [])]
    const fields = ENTITY_FIELDS[form.builderConfig?.entity || "AlumniProfile"]
    filters.push({ field: fields[0]?.id, operator: "equals", value: "" })
    setBC({ filters })
  }

  const removeFilter = (i: number) => {
    const filters = [...(form.builderConfig?.filters || [])]
    filters.splice(i, 1)
    setBC({ filters })
  }

  const updateFilter = (i: number, val: Partial<BuilderFilter>) => {
    const filters = [...(form.builderConfig?.filters || [])]
    filters[i] = { ...filters[i], ...val }
    setBC({ filters })
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Widget</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Total Alumni"
            value={form.name ?? ""}
            onChange={e => set("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Deskripsi</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Jumlah alumni yang disetujui"
            value={form.description ?? ""}
            onChange={e => set("description", e.target.value)}
          />
        </div>
      </div>

      {/* Query Mode Toggle */}
      <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-fit">
        <button
          onClick={() => set("useRawQuery", false)}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${!form.useRawQuery ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Visual Builder
        </button>
        <button
          onClick={() => set("useRawQuery", true)}
          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${form.useRawQuery ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Raw SQL
        </button>
      </div>

      {/* Builder / SQL Editor */}
      {!form.useRawQuery ? (
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Entitas Data</label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                value={form.builderConfig?.entity}
                onChange={e => setBC({ entity: e.target.value as any, filters: [] })}
              >
                {BUILDER_ENTITIES.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Agregasi</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                  value={form.builderConfig?.aggregation}
                  onChange={e => setBC({ aggregation: e.target.value as any })}
                >
                  <option value="count">Count (Jumlah)</option>
                  <option value="sum">Sum (Total Nilai)</option>
                  <option value="avg">Average (Rata-rata)</option>
                </select>
                {(form.builderConfig?.aggregation === "sum" || form.builderConfig?.aggregation === "avg") && (
                  <select
                    className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                    value={form.builderConfig?.aggregationField}
                    onChange={e => setBC({ aggregationField: e.target.value })}
                  >
                    <option value="">Pilih Kolom...</option>
                    {ENTITY_FIELDS[form.builderConfig?.entity || "AlumniProfile"].map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filter Data</label>
              <button onClick={addFilter} className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
                <Plus size={12} /> Tambah Filter
              </button>
            </div>
            {form.builderConfig?.filters.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Tanpa filter (ambil semua data)</p>
            ) : (
              <div className="space-y-2">
                {form.builderConfig?.filters.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      value={f.field}
                      onChange={e => updateFilter(i, { field: e.target.value })}
                    >
                      {ENTITY_FIELDS[form.builderConfig?.entity || "AlumniProfile"].map(field => (
                        <option key={field.id} value={field.id}>{field.label}</option>
                      ))}
                    </select>
                    <select
                      className="w-32 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      value={f.operator}
                      onChange={e => updateFilter(i, { operator: e.target.value as any })}
                    >
                      <option value="equals">Sama Dengan</option>
                      <option value="contains">Mengandung</option>
                      <option value="not">Tidak Sama</option>
                      <option value="gt">&gt;</option>
                      <option value="lt">&lt;</option>
                    </select>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      placeholder="Nilai"
                      value={f.value}
                      onChange={e => updateFilter(i, { value: e.target.value })}
                    />
                    <button onClick={() => removeFilter(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <Database size={12} /> SQL Query
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            rows={5}
            value={form.sqlQuery ?? ""}
            onChange={e => set("sqlQuery", e.target.value)}
            placeholder='SELECT COUNT(*) as value FROM "AlumniProfile"'
            spellCheck={false}
          />
        </div>
      )}

      <button
        onClick={runTest}
        disabled={testing}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {testing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        Test Jalankan Query
      </button>

      {/* Preview */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Preview Hasil</label>
        <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <WidgetPreview widget={form} result={testResult} />
        </div>
      </div>

      {/* Chart Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipe Tampilan</label>
        <div className="flex gap-2 flex-wrap">
          {(["number", "table", "bar", "pie"] as ChartType[]).map(t => {
            const Icon = CHART_ICONS[t]
            return (
              <button
                key={t}
                onClick={() => set("chartType", t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${form.chartType === t ? "bg-emerald-500 text-white border-emerald-500" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-emerald-500"}`}
              >
                <Icon size={14} /> {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* Color & Width */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Warna</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => set("color", c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-zinc-900 dark:border-white scale-110" : "border-transparent"} bg-${c}-500`}
                title={c}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Lebar Kolom (1–4)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => set("colSpan", n)}
                className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${form.colSpan === n ? "bg-emerald-500 text-white border-emerald-500" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-emerald-500"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.name?.trim() || !form.sqlQuery?.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Widget
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
          Batal
        </button>
      </div>
    </div>
  )
}

export default function DashboardWidgetsPage() {
  const { data: session } = useSession()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editWidget, setEditWidget] = useState<Widget | null>(null)
  const [saving, setSaving] = useState(false)
  const [runResults, setRunResults] = useState<Record<string, WidgetResult>>({})
  const [running, setRunning] = useState<Record<string, boolean>>({})

  const isSuperuser = (session?.user as any)?.role === "SUPERUSER"

  const loadWidgets = useCallback(async () => {
    const res = await fetch("/api/dashboard-widgets")
    const data = await res.json()
    setWidgets(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { loadWidgets() }, [loadWidgets])

  const runWidget = async (w: Widget) => {
    setRunning(p => ({ ...p, [w.id]: true }))
    const res = await fetch("/api/dashboard-widgets/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: w.sqlQuery }),
    })
    const json = await res.json()
    setRunResults(p => ({ ...p, [w.id]: json }))
    setRunning(p => ({ ...p, [w.id]: false }))
  }

  const handleSave = async (data: Partial<Widget>) => {
    setSaving(true)
    if (editWidget) {
      await fetch(`/api/dashboard-widgets/${editWidget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch("/api/dashboard-widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...emptyWidget(), ...data }),
      })
    }
    setSaving(false)
    setShowForm(false)
    setEditWidget(null)
    loadWidgets()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus widget ini?")) return
    await fetch(`/api/dashboard-widgets/${id}`, { method: "DELETE" })
    loadWidgets()
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
  }

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dashboard Widget
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Buat widget custom dengan SQL query</p>
          </div>
          {isSuperuser && (
            <button
              onClick={() => { setEditWidget(null); setShowForm(true) }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus size={18} /> Tambah Widget
            </button>
          )}
        </div>

        {/* Form modal */}
        {(showForm || editWidget) && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditWidget(null) }}>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">
                  {editWidget ? "Edit Widget" : "Tambah Widget"}
                </h2>
                <button onClick={() => { setShowForm(false); setEditWidget(null) }} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-all">
                  <X size={18} />
                </button>
              </div>
              <WidgetForm
                initial={editWidget ?? emptyWidget()}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditWidget(null) }}
                isSaving={saving}
              />
            </div>
          </div>
        )}

        {/* Widgets Grid */}
        {widgets.length === 0 ? (
          <div className="glass p-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <LayoutDashboard size={48} className="mx-auto text-zinc-300 mb-4" />
            <p className="text-zinc-500 font-bold">Belum ada widget. Tambah yang pertama!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {widgets.map(w => {
              const result = runResults[w.id]
              const isRunning = running[w.id]
              const Icon = CHART_ICONS[w.chartType as ChartType] ?? Hash

              return (
                <div key={w.id} className={`glass rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 ${colSpanClass(w.colSpan)}`}>
                  {/* Widget header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${colorClass(w.color)}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-outfit font-bold text-zinc-900 dark:text-white text-sm">{w.name}</p>
                        {w.description && <p className="text-xs text-zinc-400">{w.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => runWidget(w)}
                        disabled={isRunning}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                        title="Jalankan Query"
                      >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      </button>
                      {isSuperuser && (
                        <>
                          <button onClick={() => { setEditWidget(w); setShowForm(false) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all" title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Result */}
                  <WidgetPreview widget={w} result={result ?? null} />

                  {/* Query preview */}
                  <details className="group">
                    <summary className="flex items-center gap-1 text-[10px] text-zinc-400 cursor-pointer select-none hover:text-zinc-600 transition-colors list-none">
                      <ChevronDown size={12} className="group-open:rotate-180 transition-transform" /> SQL Query
                    </summary>
                    <pre className="mt-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 overflow-auto max-h-32 whitespace-pre-wrap">
                      {w.sqlQuery}
                    </pre>
                  </details>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
