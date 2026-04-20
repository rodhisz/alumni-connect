import { getMasterData } from "@/core/actions/master-data"
import MasterDataTable from "./MasterDataTable"
import MasterDataHeaderClient from "./MasterDataHeaderClient"
import { CATEGORY_OPTIONS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function MasterDataPage() {
  const { data: masterData, error } = await getMasterData()

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <h2>Error: {error}</h2>
      </div>
    )
  }

  const categories = CATEGORY_OPTIONS.filter(c => c.value !== "APPROVER_EMAIL")

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <MasterDataHeaderClient />
        <MasterDataTable initialData={masterData || []} categories={categories} />
      </div>
    </div>
  )
}
