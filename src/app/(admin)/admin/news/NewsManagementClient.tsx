"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Globe, EyeOff, Calendar, User } from "lucide-react"
import { useLanguage } from "@/components/Providers"
import { deleteNews } from "@/core/actions/news"

export default function NewsManagementClient({ initialNews }: { initialNews: any[] }) {
  const { t, lang } = useLanguage()
  const [news, setNews] = useState(initialNews)
  const [search, setSearch] = useState("")

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return
    const res = await deleteNews(id)
    if (res.success) {
      setNews(news.filter(n => n.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-outfit font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            {t("news_management")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            {lang === 'id' ? "Kelola publikasi konten, berita, dan artikel terbaru." : "Manage content publications, news, and latest articles."}
          </p>
        </div>

        <Link
          href="/admin/news/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} />
          {t("create")}
        </Link>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder={lang === 'id' ? "Cari berita..." : "Search news..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((n) => (
          <div key={n.id} className="glass-premium rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col group transition-all hover:shadow-2xl hover:shadow-blue-500/5">
            {n.image && (
              <div className="aspect-video w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img src={n.image} alt={n.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {!n.isPublished && (
                    <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                        <EyeOff size={12} /> {t("unpublished")}
                    </div>
                )}
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 line-clamp-2 leading-tight">
                {n.title}
              </h3>
              
              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    {n.author.name}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Link 
                    href={`/admin/news/${n.id}/edit`}
                    className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Edit size={18} />
                  </Link>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(n.id)}
                      className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link 
                      href={`/news/${n.slug}`}
                      target="_blank"
                      className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                    >
                      <Globe size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="py-20 text-center">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-bold">{t("no_data")}</p>
        </div>
      )}
    </div>
  )
}
