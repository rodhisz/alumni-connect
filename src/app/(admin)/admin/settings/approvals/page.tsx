import { getApproverSettingsData } from "@/core/actions/settings"
import ApproverSettings from "./ApproverSettings"
import SettingsHeaderClient from "./SettingsHeaderClient"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const { data, error } = await getApproverSettingsData()

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <SettingsHeaderClient />

        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">Error: {error}</div>
        ) : (
          <ApproverSettings users={data?.users || []} approvers={data?.approvers || []} />
        )}
      </div>
    </div>
  )
}
