import { getNewsDetail } from "@/core/actions/news"
import HomeNavbar from "@/components/HomeNavbar"
import { notFound } from "next/navigation"
import NewsDetailClient from "../NewsDetailClient"

export const dynamic = "force-dynamic"

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: news, error } = await getNewsDetail(slug)

  if (error || !news) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500 pt-32 pb-32">
      <HomeNavbar />
      <NewsDetailClient news={news} />
    </main>
  )
}
