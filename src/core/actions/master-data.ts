"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Category } from "@prisma/client"

export async function getMasterData(category?: Category) {
  try {
    const data = await prisma.masterData.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addMasterData(data: { category: Category; name: string; description?: string; order?: number }) {
  if (!data.name || !data.category) return { success: false, error: "Nama dan Kategori wajib diisi." }

  try {
    const newItem = await prisma.masterData.create({
      data: {
        category: data.category,
        name: data.name,
        description: data.description || null,
        order: data.order || 0,
      }
    })
    revalidatePath("/admin/master")
    return { success: true, data: newItem }
  } catch (e: any) {
    return { success: false, error: e.message || "Gagal menambahkan data opsi." }
  }
}

export async function toggleMasterDataStatus(id: string, currentStatus: boolean) {
  try {
    await prisma.masterData.update({
      where: { id },
      data: { isActive: !currentStatus }
    })
    revalidatePath("/admin/master")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || "Gagal mengubah status opsi." }
  }
}

export async function deleteMasterData(id: string) {
  try {
    await prisma.masterData.delete({
      where: { id }
    })
    revalidatePath("/admin/master")
    return { success: true }
  } catch (e: any) {
    // Cannot delete if it is being referenced by other records
    if (e.code === 'P2003') {
      return { success: false, error: "Tidak dapat menghapus opsi ini karena sedang digunakan oleh profil alumni. Pertimbangkan untuk menonaktifkannya saja." }
    }
    return { success: false, error: e.message || "Gagal menghapus data opsi." }
  }
}

export async function updateMasterDataOrder(updates: { id: string; order: number }[]) {
  try {
    await prisma.$transaction(
      updates.map(u => 
        prisma.masterData.update({
          where: { id: u.id },
          data: { order: u.order }
        })
      )
    )
    revalidatePath("/admin/master")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || "Gagal memperbarui urutan." }
  }
}
