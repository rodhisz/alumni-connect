"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export async function getAllUsers(page: number = 1, pageSize: number = 10, search: string = "") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    return { 
      success: true, 
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER_ROLE",
        entityType: "User",
        entityId: userId,
        userId: session.user.id,
        changes: { newRole }
      }
    })

    revalidatePath("/admin/settings/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah role." }
  }
}

export async function adminChangePassword(userId: string, newPassword: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const passwordHash = bcrypt.hashSync(newPassword, 10)
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    })

    await prisma.auditLog.create({
      data: {
        action: "ADMIN_RESET_PASSWORD",
        entityType: "User",
        entityId: userId,
        userId: session.user.id,
        changes: { note: "Password direset paksa oleh admin melalui User Management." }
      }
    })

    revalidatePath("/admin/settings/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah password." }
  }
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "SUPERUSER") {
    return { success: false, error: "Unauthorized" }
  }

  // Prevent self deletion
  if (session.user.id === userId) {
      return { success: false, error: "Sidemount alert: Anda tidak bisa menghapus diri sendiri dari sesi aktif." }
  }

  try {
    const user = await prisma.user.delete({
      where: { id: userId }
    })

    await prisma.auditLog.create({
      data: {
        action: "DELETE_USER",
        entityType: "User",
        entityId: userId,
        userId: session.user.id,
        changes: { email: user.email, name: user.name }
      }
    })

    revalidatePath("/admin/settings/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus user." }
  }
}
