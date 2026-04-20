"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getNotifications() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, data: [] }

  const role = session.user.role
  
  try {
    // Determine which notifications to show
    let where: any = {}
    
    if (role === "ALUMNI") {
      // Only personal notifications for alumni
      where = { userId: session.user.id }
    } else {
      // For Admins: Personal notifications OR notifications for all admins (userId: null)
      where = {
        OR: [
          { userId: session.user.id },
          { userId: null }
        ]
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10
    })
    
    return { success: true, data: notifications }
  } catch (error: any) {
    console.error("Fetch notifications error:", error)
    return { success: false, error: error.message }
  }
}

export async function markAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markAllAsRead() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const role = session.user.role
  
  try {
    let where: any = {}
    if (role === "ALUMNI") {
      where = { userId: session.user.id }
    } else {
      where = {
        OR: [
          { userId: session.user.id },
          { userId: null }
        ]
      }
    }

    await prisma.notification.updateMany({
      where: { ...where, isRead: false },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createNotification(data: {
  userId?: string | null
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "DANGER" | "APPROVAL_REQUEST"
  link?: string
}) {
  try {
    const notif = await prisma.notification.create({
      data: {
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link
      }
    })
    return { success: true, data: notif }
  } catch (error: any) {
    console.error("Create notification error:", error)
    return { success: false, error: error.message }
  }
}
