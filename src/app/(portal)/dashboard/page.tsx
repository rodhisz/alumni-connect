import { getMyProfile } from "@/core/actions/portal"
import DashboardPortalClient from "./DashboardPortalClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { data: profile, error } = await getMyProfile()

  if (error || !profile) {
    return (
      <div className="p-8 max-w-6xl mx-auto mt-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <p>Error: {error || "Profile not found."}</p>
        </div>
      </div>
    )
  }

  return <DashboardPortalClient profile={profile} />
}
