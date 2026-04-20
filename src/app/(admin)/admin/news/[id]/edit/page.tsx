import { getNewsDetail } from "@/core/actions/news"
import { redirect } from "next/navigation"
import NewsForm from "../../NewsForm"

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: news, error } = await getNewsDetail(id)

  if (error || !news) {
    redirect("/admin/news")
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 sm:pb-8 w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-outfit font-black text-zinc-900 dark:text-white uppercase tracking-tight">Edit Berita</h1>
        <p className="text-zinc-500 font-medium">Perbarui konten artikel "{news.title}".</p>
      </div>
      <NewsForm initialData={news} id={news.id} />
    </div>
  )
}
