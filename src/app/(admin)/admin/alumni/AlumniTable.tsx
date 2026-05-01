"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Trash2, Edit, Eye, ChevronLeft, ChevronRight, Filter, Settings2, Check } from "lucide-react"
import { deleteAlumni, getAlumniList } from "@/core/actions/alumni"
import { useConfirm } from "@/components/ConfirmProvider"
import { FileSpreadsheet } from "lucide-react"
import ExcelImportModal from "@/components/ExcelImportModal"
import { importAlumniBulk, importAlumniFullBulk } from "@/core/actions/import"
import { useLanguage } from "@/components/Providers"

type UserWithProfile = {
  id: string
  email: string
  name: string | null
  createdAt: Date
  profile: {
    status: string
    isMale: boolean | null
    phoneNumber: string | null
    startYear: number | null
    graduationYear: string | null
  } | null
}

export default function AlumniTable({ initialResponse, role, initialColumns = "reg_date,status" }: { initialResponse: any, role?: string, initialColumns?: string }) {
  const [data, setData] = useState<UserWithProfile[]>(initialResponse.data || [])
  const [pagination, setPagination] = useState(initialResponse.pagination)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showImportBasic, setShowImportBasic] = useState(false)
  const [showImportFull, setShowImportFull] = useState(false)
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL")
  
  // Custom columns logic
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialColumns.split(","))
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [savingColumns, setSavingColumns] = useState(false)

  const { t, lang } = useLanguage()

  const availableColumns = [
    { id: "reg_date", label: lang === "id" ? "Tanggal Registrasi" : "Reg. Date" },
    { id: "gender", label: lang === "id" ? "Jenis Kelamin" : "Gender" },
    { id: "phone", label: lang === "id" ? "No HP" : "Phone" },
    { id: "start_year", label: lang === "id" ? "Tahun Masuk" : "Start Year" },
    { id: "grad_year", label: lang === "id" ? "Tahun Lulus" : "Grad Year" },
    { id: "status", label: "Status" }
  ];

  const fetchData = useCallback(async (p: number, s: string, g: string) => {
    setLoading(true)
    const res = await getAlumniList(p, 10, s, g)
    if (res.success) {
      setData(res.data || [])
      setPagination(res.pagination)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search, genderFilter)
    }, 500)
    return () => clearTimeout(timer)
  }, [page, search, genderFilter, fetchData])

  const handleDelete = async (id: string, name: string) => {
    const confirmation = window.prompt(lang === 'id' ? `Ketik "${name}" untuk mengonfirmasi penghapusan:` : `Type "${name}" to confirm deletion:`)
    if (confirmation !== name) {
      if (confirmation !== null) alert(lang === 'id' ? "Nama tidak cocok." : "Name doesn't match.")
      return
    }

    const res = await deleteAlumni(id)
    if (res.success) {
      fetchData(page, search, genderFilter)
    } else {
      alert(res.error)
    }
  }

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(col => col !== id) : [...prev, id]
    )
  }

  const saveColumnSettings = async () => {
    setSavingColumns(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumni_table_columns: visibleColumns.join(",") })
      })
      setShowColumnSettings(false)
    } catch (e) {
      console.error(e)
    }
    setSavingColumns(false)
  }

  return (
    <>
      <div className="glass rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between gap-4 items-center bg-white/50 dark:bg-black/20">
          <div className="flex flex-col sm:flex-row w-full md:w-auto flex-1 gap-3">
            <div className="relative flex-1 md:max-w-xs">
              {loading ? (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              )}
              <input 
                type="text" 
                placeholder={t("search_alumni")} 
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value as any)
                setPage(1)
              }}
              className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm min-w-36"
            >
              <option value="ALL">{lang === "id" ? "Semua Gender" : "All Gender"}</option>
              <option value="MALE">{lang === "id" ? "Laki-laki" : "Male"}</option>
              <option value="FEMALE">{lang === "id" ? "Perempuan" : "Female"}</option>
            </select>
          </div>
          
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {role !== "ALUMNI" && (
                <>
                  <button 
                    onClick={() => setShowImportBasic(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    <FileSpreadsheet size={16} />
                    {lang === 'id' ? "Import User" : "Import User Only"}
                  </button>

                  <button 
                    onClick={() => setShowImportFull(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <FileSpreadsheet size={16} />
                    {lang === 'id' ? "Import Lengkap (Lama)" : "Import Full (Legacy)"}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowColumnSettings(!showColumnSettings)}
                      className="flex items-center justify-center p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                      title={lang === "id" ? "Pengaturan Kolom" : "Column Settings"}
                    >
                      <Settings2 size={18} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    {showColumnSettings && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase">{lang === "id" ? "Kolom Ditampilkan" : "Visible Columns"}</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {availableColumns.map(col => (
                            <label key={col.id} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${visibleColumns.includes(col.id) ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                {visibleColumns.includes(col.id) && <Check size={12} className="text-white" />}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={visibleColumns.includes(col.id)} 
                                onChange={() => toggleColumn(col.id)}
                              />
                              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{col.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                          <button 
                            onClick={saveColumnSettings}
                            disabled={savingColumns}
                            className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                          >
                            {savingColumns ? "..." : (lang === "id" ? "Simpan Perubahan" : "Save Changes")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href="/admin/alumni/create"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-medium text-sm hover:scale-[1.02] transition-transform shadow-xl"
                  >
                    <Plus size={18} />
                    {t("create")}
                  </Link>
                </>
              )}
            </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative">
          {loading && (
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
          )}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">{t("full_name")} & {t("email")}</th>
                {availableColumns.map(col => visibleColumns.includes(col.id) && (
                  <th key={col.id} className="p-4 font-medium">{col.label}</th>
                ))}
                <th className="p-4 font-medium text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.length === 0 && !loading ? (
                <tr>
                  <td colSpan={availableColumns.filter(c => visibleColumns.includes(c.id)).length + 2} className="p-8 text-center text-zinc-500">
                    {t("no_alumni")}
                  </td>
                </tr>
              ) : data.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{user.name || (lang === "id" ? "Tanpa Nama" : "Unnamed")}</div>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                  </td>
                  
                  {visibleColumns.includes("reg_date") && (
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  )}
                  {visibleColumns.includes("gender") && (
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {user.profile?.isMale !== null ? (user.profile?.isMale ? (lang === "id" ? "Laki-laki" : "Male") : (lang === "id" ? "Perempuan" : "Female")) : "-"}
                    </td>
                  )}
                  {visibleColumns.includes("phone") && (
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {user.profile?.phoneNumber || "-"}
                    </td>
                  )}
                  {visibleColumns.includes("start_year") && (
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {user.profile?.startYear || "-"}
                    </td>
                  )}
                  {visibleColumns.includes("grad_year") && (
                    <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {user.profile?.graduationYear || "-"}
                    </td>
                  )}
                  {visibleColumns.includes("status") && (
                    <td className="p-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                         user.profile?.status === 'APPROVED' ? (
                           user.profile.isMale === true 
                             ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" 
                             : "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800"
                         ) :
                         user.profile?.status === 'WAITING' ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" :
                         "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                       }`}>
                         {user.profile?.status === 'APPROVED' ? t("approved") :
                          user.profile?.status === 'WAITING' ? t("waiting_approval") :
                          user.profile?.status === 'REJECTED' ? t("rejected") :
                          user.profile?.status || t("draft")}
                     </span>
                    </td>
                  )}

                  <td className="p-4 flex items-center justify-end gap-2">
                    <Link href={`/admin/alumni/${user.id}`} title={lang === "id" ? "Lihat Detail" : "View Detail"} className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <Eye size={16} />
                    </Link>
                    {role !== "ALUMNI" && (
                      <>
                        <Link href={`/admin/alumni/${user.id}/edit`} title={t("edit")} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(user.id, user.name || (lang === 'id' ? "Tanpa Nama" : "Unnamed"))} title={t("delete")} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50 dark:bg-black/10">
          <div className="text-xs text-zinc-500 font-medium">
            {lang === 'id' ? `Menampilkan ${data.length} dari ${pagination?.total || 0} alumni` : `Showing ${data.length} of ${pagination?.total || 0} alumni`}
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, pagination?.totalPages || 0))].map((_, i) => {
                let pNum = 1;
                if (pagination.totalPages <= 5) pNum = i + 1;
                else if (page <= 3) pNum = i + 1;
                else if (page >= pagination.totalPages - 2) pNum = pagination.totalPages - 4 + i;
                else pNum = page - 2 + i;

                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${
                        page === pNum 
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" 
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
                    }`}
                  >
                    {pNum}
                  </button>
                )
              })}
            </div>

            <button 
              disabled={page >= (pagination?.totalPages || 1) || loading}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <ExcelImportModal 
        isOpen={showImportBasic}
        onClose={() => setShowImportBasic(false)}
        title={lang === "id" ? "Import User Alumni" : "Import Alumni Users"}
        templateFilename="alumni_connect_users"
        templateHeaders={lang === "id" ? ["Nama Lengkap", "Email"] : ["Full Name", "Email"]}
        templateExampleRows={[
          ["Budi Santoso", "budi@email.com"],
          ["Siti Aminah", "siti@email.com"]
        ]}
        onImport={importAlumniBulk}
      />

      <ExcelImportModal 
        isOpen={showImportFull}
        onClose={() => setShowImportFull(false)}
        title={lang === "id" ? "Import Data Lengkap Alumni" : "Import Full Alumni Data"}
        templateFilename="alumni_connect_legacy_data"
        templateHeaders={lang === "id" 
          ? ["Nama Lengkap", "Email", "No HP", "Tahun Masuk", "Tahun Lulus", "Jenjang Terakhir"] 
          : ["Full Name", "Email", "Phone Number", "Start Year", "Graduation Year", "Highest Education"]
        }
        templateExampleRows={[
          ["Budi Santoso", "budi@email.com", "0812345678", "2010", "2014", "SMA_12"],
          ["Siti Aminah", "siti@email.com", "0812345679", "2011", "2015", "SMA_12"]
        ]}
        onImport={importAlumniFullBulk}
      />
    </>
  )
}
