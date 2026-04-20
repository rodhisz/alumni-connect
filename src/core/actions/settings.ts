"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getApproverSettingsData() {
  try {
    // Fetch all users that can potentially be an approver
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true },
      orderBy: { name: "asc" }
    })

    // Fetch existing approvers in Master Data
    const approvers = await prisma.masterData.findMany({
      where: { category: "APPROVER_EMAIL" },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, data: { users, approvers } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addApproverEmail(email: string) {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role
  if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  if (!email) return { success: false, error: "Email wajib diisi" }
  const cleanEmail = email.toLowerCase()

  try {
    const existing = await prisma.masterData.findFirst({
      where: { category: "APPROVER_EMAIL", name: cleanEmail }
    })

    if (existing) {
      if (!existing.isActive) {
        await prisma.masterData.update({
          where: { id: existing.id },
          data: { isActive: true }
        })
        revalidatePath("/admin/settings")
        return { success: true }
      }
      return { success: false, error: "Email ini sudah menjadi Approver." }
    }

    await prisma.masterData.create({
      data: {
        category: "APPROVER_EMAIL",
        name: cleanEmail,
        description: "Admin Privilege Granted via Approver Status",
        isActive: true
      }
    })

    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function removeApproverEmail(id: string) {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role
  if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.masterData.delete({
      where: { id }
    })
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
