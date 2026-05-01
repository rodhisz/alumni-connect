import { getAlumniDetails } from "@/core/actions/alumni"
import { redirect } from "next/navigation"
import AlumniDetailClient from "./AlumniDetailClient"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AlumniDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || "ALUMNI"

  const { data: user, error } = await getAlumniDetails(id)

  if (error || !user) {
    redirect("/admin/alumni")
  }

  return <AlumniDetailClient id={id} user={user} role={role} currentUserId={session?.user?.id} />
}
