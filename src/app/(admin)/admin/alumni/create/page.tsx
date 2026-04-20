import { getMasterData } from "@/core/actions/master-data"
import CreateAlumniForm from "./CreateAlumniForm"
import { MasterData } from "@prisma/client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreateAlumniPage() {
  const { data: masterData, error } = await getMasterData()

  // Group master data by category
  const options = (masterData || []).filter(item => item.isActive).reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push({ value: item.id, label: item.name })
    return acc
  }, {} as Record<string, { value: string; label: string }[]>)

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/alumni" className="p-2 -ml-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Create Alumni Data
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Isi kelengkapan data diri, histori kealumnian, domisili, dan riwayat pekerjaan.
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            Gagal memuat preferensi Master Data. Harap cek koneksi Anda.
          </div>
        ) : (
          <CreateAlumniForm options={options} />
        )}
      </div>
    </div>
  )
}
