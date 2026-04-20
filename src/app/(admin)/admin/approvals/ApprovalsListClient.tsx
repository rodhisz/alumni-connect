"use client"

import Link from "next/link"
import { Eye, Clock } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function ApprovalsListClient({ revisions }: { revisions: any[] }) {
  const { t, lang } = useLanguage()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("alumni_approvals")}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {lang === "id" 
            ? "Verifikasi pengajuan log perubahan data dari Alumni sebelum mengudara."
            : "Verify change log submissions from Alumni before publishing."}
        </p>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium dark:text-zinc-300">{lang === "id" ? "Tanggal Pengajuan" : "Submission Date"}</th>
                <th className="p-4 font-medium dark:text-zinc-300">{lang === "id" ? "Nama Alumni" : "Alumni Name"}</th>
                <th className="p-4 font-medium dark:text-zinc-300">Email</th>
                <th className="p-4 font-medium dark:text-zinc-300">Status</th>
                <th className="p-4 font-medium text-right dark:text-zinc-300">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white/50 dark:bg-zinc-900/50">
              {revisions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    {lang === "id" ? "Tidak ada antrean persetujuan. Sip!" : "No pending approvals. All good!"}
                  </td>
                </tr>
              ) : revisions?.map((rev: any) => (
                <tr key={rev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-300">
                     <div className="flex items-center gap-2">
                       <Clock size={14} className="text-orange-500"/>
                       {new Date(rev.createdAt).toLocaleString(lang === "id" ? "id-ID" : "en-US")}
                     </div>
                  </td>
                  <td className="p-4 font-medium text-sm text-zinc-900 dark:text-zinc-100">{rev.fullName || rev.profile.fullName}</td>
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{rev.user.email}</td>
                  <td className="p-4">
                     <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30">
                       {lang === "id" ? "Menunggu Verifikasi" : "Pending Verification"}
                     </span>
                  </td>
                  <td className="p-4 flex justify-end">
                    <Link 
                      href={`/admin/approvals/${rev.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Eye size={16} />
                      {lang === "id" ? "Tinjau Berkas" : "Review File"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
