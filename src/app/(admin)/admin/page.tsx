import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || "ALUMNI"

  if (role === "ALUMNI") {
    redirect("/admin/profile")
  } else {
    redirect("/admin/alumni")
  }
}
