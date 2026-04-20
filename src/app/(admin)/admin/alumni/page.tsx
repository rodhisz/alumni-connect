import { getAlumniList } from "@/core/actions/alumni"
import AlumniTable from "./AlumniTable"
import AlumniDirectoryHeaderClient from "./AlumniDirectoryHeaderClient"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AlumniPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || "ALUMNI"

  if (role !== "ADMIN" && role !== "SUPERUSER") {
    redirect("/admin")
  }

  const result = await getAlumniList(1, 10)

  if (result.error) {
    return (
      <div className="p-8 text-red-500">
        <h2>Error: {result.error}</h2>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <AlumniDirectoryHeaderClient />
        <AlumniTable initialResponse={result} />
      </div>
    </div>
  )
}
