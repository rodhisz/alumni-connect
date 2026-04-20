import { getNewsList } from "@/core/actions/news"
import HomeNavbar from "@/components/HomeNavbar"
import NewsListingClient from "./NewsListingClient"

export const dynamic = "force-dynamic"

export default async function NewsListingPage() {
  const { data: news = [] } = await getNewsList(false) // Only published

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 pt-32 pb-24">
      <HomeNavbar />
      <NewsListingClient news={news} />
    </main>
  )
}
