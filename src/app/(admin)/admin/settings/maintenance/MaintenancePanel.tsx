"use client"

import { useState } from "react"
import { Trash2, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react"
import { useConfirm } from "@/components/ConfirmProvider"
import { useLanguage } from "@/components/Providers"
import { deleteAllAlumni, hardResetSystem } from "@/core/actions/maintenance"

export default function MaintenancePanel() {
  const { confirm } = useConfirm()
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleDeleteAll = () => {
    confirm({
      title: lang === 'id' ? "Hapus SEMUA Alumni?" : "Delete ALL Alumni?",
      message: lang === 'id' 
        ? "Seluruh data user dengan role ALUMNI akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
        : "All user data with ALUMNI role will be permanently deleted. This action cannot be undone.",
      confirmText: lang === 'id' ? "Ya, Hapus Semua" : "Yes, Delete All",
      type: "danger",
      onConfirm: async () => {
        setLoading(true)
        const res = await deleteAllAlumni()
        if (res.success) {
          alert(lang === 'id' ? "Semua data alumni berhasil dihapus." : "All alumni data has been deleted.")
        } else {
          alert(res.error)
        }
        setLoading(false)
      }
    })
  }

  const handleHardReset = () => {
    const confirmationText = lang === 'id' ? "Ya Saya Yakin" : "Yes Confirm"
    const input = window.prompt(lang === 'id' 
      ? `HARD RESET: Semua data system akan dihapus (Audit Logs, Master Data, Users). Akun anda sebagai SuperUser akan tetap ada.\n\nKetik "${confirmationText}" untuk mengonfirmasi:`
      : `HARD RESET: All system data will be deleted (Audit Logs, Master Data, Users). Your SuperUser account will remain.\n\nType "${confirmationText}" to confirm:`)

    if (input !== confirmationText) {
      if (input !== null) alert(lang === 'id' ? "Konfirmasi tidak cocok. Pembatalan dilakukan." : "Confirmation mismatch. Action cancelled.")
      return
    }

    confirm({
      title: "FINAL CONFIRMATION: HARD RESET",
      message: lang === 'id' ? "PERINGATAN TERAKHIR: Semua data akan hilang selamanya." : "LAST WARNING: All data will be lost forever.",
      confirmText: "RESET SYSTEM",
      type: "danger",
      onConfirm: async () => {
        setLoading(true)
        const res = await hardResetSystem()
        if (res.success) {
          window.location.href = "/admin"
        } else {
          alert(res.error)
        }
        setLoading(false)
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <ShieldCheck className="text-red-500" size={24} />
          <div>
            <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">
               {lang === 'id' ? "Pemeliharaan Sistem (Danger Zone)" : "System Maintenance (Danger Zone)"}
            </h2>
            <p className="text-sm text-zinc-500">Tindakan di bawah ini bersifat destruktif dan permanen.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 size={24} />
              <h3 className="font-bold">Erase Alumni Data</h3>
            </div>
            <p className="text-sm text-zinc-500">
              Menghapus semua akun alumni dan profil terkait dari database.
            </p>
            <button 
              onClick={handleDeleteAll}
              disabled={loading}
              className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
            >
              Hapus Data Alumni
            </button>
          </div>

          <div className="p-6 border border-red-200 dark:border-red-900/50 bg-red-500/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <RefreshCw size={24} className="animate-spin-slow" />
              <h3 className="font-bold uppercase tracking-widest text-lg">Hard Reset</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Menghapus SELURUH data sistem termasuk Master Data, Log Audit, dan User (kecuali anda).
            </p>
            <button 
              onClick={handleHardReset}
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              Jalankan Hard Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
