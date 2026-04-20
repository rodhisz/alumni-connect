import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Verify user exists to avoid Foreign Key errors on stale sessions
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!userExists) {
    // This happens if the user was deleted/recreated but the browser still has the old session cookie
    redirect("/login?error=SessionExpired")
  }

  // Find or create profile for this user
  let profile = await prisma.alumniProfile.findFirst({
    where: { userId: session.user.id }
  })

  // If no profile, create a default one
  if (!profile) {
    try {
      profile = await prisma.alumniProfile.create({
        data: {
          userId: session.user.id,
          fullName: session.user.name || "Alumni Baru",
          status: "WAITING", // Default status for new profiles
        }
      })
    } catch (e) {
      console.error("Failed to create profile:", e)
      // Profile might have been created by a parallel request
      profile = await prisma.alumniProfile.findFirst({
        where: { userId: session.user.id }
      })
      if (!profile) redirect("/admin?error=ProfileError")
    }
  }

  // Redirect to the detail page for this profile/user
  redirect(`/admin/alumni/${session.user.id}`)
}
