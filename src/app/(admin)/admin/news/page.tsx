import { getNewsList } from "@/core/actions/news"
import NewsManagementClient from "./NewsManagementClient"

export const dynamic = "force-dynamic"

export default async function NewsAdminPage() {
  const { data: news = [] } = await getNewsList(true) // Include unpublished

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 sm:pb-8 w-full">
      <NewsManagementClient initialNews={news} />
    </div>
  )
}
