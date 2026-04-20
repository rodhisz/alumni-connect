import NewsForm from "../NewsForm"

export default function CreateNewsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 sm:pb-8 w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-outfit font-black text-zinc-900 dark:text-white uppercase tracking-tight">Buat Berita Baru</h1>
        <p className="text-zinc-500 font-medium">Publikasikan informasi terbaru untuk komunitas alumni.</p>
      </div>
      <NewsForm />
    </div>
  )
}
