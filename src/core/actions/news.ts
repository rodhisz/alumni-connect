"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getNewsList(includeUnpublished = false) {
  try {
    const news = await (prisma as any).news?.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: news }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function getNewsDetail(idOrSlug: string) {
  try {
    const news = await (prisma as any).news?.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    })
    return { success: true, data: news }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createNews(data: { title: string; slug: string; content: string; image?: string; isPublished?: boolean }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const news = await (prisma as any).news?.create({
      data: {
        ...data,
        authorId: session.user.id
      }
    })
    revalidatePath("/admin/news")
    revalidatePath("/")
    return { success: true, data: news }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateNews(id: string, data: any) {
  try {
    const news = await (prisma as any).news?.update({
      where: { id },
      data
    })
    revalidatePath("/admin/news")
    revalidatePath("/")
    return { success: true, data: news }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function deleteNews(id: string) {
  try {
    await (prisma as any).news?.delete({
      where: { id }
    })
    revalidatePath("/admin/news")
    revalidatePath("/")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
