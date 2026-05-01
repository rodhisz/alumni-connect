"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteAllAlumni() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized. SuperUser only." }
  }

  try {
    // Delete all profiles first to ensure clean state
    await prisma.alumniProfile.deleteMany({})
    
    // Delete all users EXCEPT SUPERUSER and ADMIN
    await prisma.user.deleteMany({
      where: { 
        role: { notIn: ["SUPERUSER", "ADMIN"] }
      }
    })
    
    revalidatePath("/admin/alumni")
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function hardResetSystem() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized. SuperUser only." }
  }

  try {
    // 1. Delete all audit logs
    await prisma.auditLog.deleteMany({})
    
    // 2. Delete all profile revisions
    await prisma.profileRevision.deleteMany({})
    
    // 3. Delete all alumni profiles (cascade should handle this if we delete users, but better safe)
    await prisma.alumniProfile.deleteMany({})
    
    // 4. Delete all users EXCEPT the current superuser
    await prisma.user.deleteMany({
      where: {
        id: { not: session.user.id }
      }
    })
    
    // 5. Delete all Master Data? User said "all data in system"
    await prisma.masterData.deleteMany({})

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
