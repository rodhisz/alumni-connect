import { getPendingRevisions } from "@/core/actions/approvals"
import ApprovalsListClient from "./ApprovalsListClient"

export const dynamic = "force-dynamic"

export default async function ApprovalsPage() {
  const { data: revisions, error } = await getPendingRevisions()

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      {error ? (
        <div className="max-w-6xl mx-auto p-4 bg-red-50 text-red-600 rounded-xl">Error: {error}</div>
      ) : (
        <ApprovalsListClient revisions={revisions || []} />
      )}
    </div>
  )
}
