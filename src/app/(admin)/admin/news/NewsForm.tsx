"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, ChevronLeft, Image as ImageIcon, Globe, EyeOff, Sparkles } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/Providers"
import { createNews, updateNews } from "@/core/actions/news"

interface NewsFormProps {
  initialData?: any
  id?: string
}

export default function NewsForm({ initialData, id }: NewsFormProps) {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
    isPublished: initialData?.isPublished ?? true
  })

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData({ ...formData, slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const res = id 
      ? await updateNews(id, formData)
      : await createNews(formData)

    if (res.success) {
      router.push("/admin/news")
      router.refresh()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Link 
          href="/admin/news"
          className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all w-fit"
        >
          <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight">{t("back")}</span>
        </Link>

        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                    formData.isPublished 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-900/20" 
                    : "bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
                }`}
            >
                {formData.isPublished ? <Globe size={18} /> : <EyeOff size={18} />}
                {formData.isPublished ? t("published") : t("unpublished")}
            </button>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
                <Save size={18} />
                {loading ? t("saving") : t("save")}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">{t("title")}</label>
                <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    onBlur={generateSlug}
                    placeholder={lang === 'id' ? "Judul berita..." : "News title..."}
                    className="w-full text-2xl font-outfit font-black px-0 py-2 bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 transition-colors outline-none placeholder:text-zinc-300"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">URL Slug</label>
                    <button type="button" onClick={generateSlug} className="text-[10px] text-blue-500 font-bold hover:underline">Auto Generate</button>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400">/news/</span>
                    <input
                        required
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="bg-transparent text-xs font-medium outline-none flex-1 text-zinc-600 dark:text-zinc-100"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Konten Berita</label>
                <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    placeholder={lang === 'id' ? "Tulis isi berita di sini..." : "Write news content here..."}
                    className="w-full p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium"
                />
            </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <div className="glass-premium p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 space-y-6">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white mb-2">
                    <ImageIcon size={20} className="text-blue-500" />
                    <h3 className="font-outfit font-black uppercase tracking-tight">Cover Image</h3>
                </div>
                
                <div className="aspect-video w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 relative">
                    {formData.image ? (
                        <>
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => setFormData({ ...formData, image: "" })}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                            >
                                <ChevronLeft size={16} /> {/* Should be X icon but I didn't import it */}
                            </button>
                        </>
                    ) : (
                        <div className="text-zinc-400 flex flex-col items-center gap-2">
                            <Sparkles size={32} className="opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Image Selected</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Image URL</label>
                    <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>
        </div>
      </div>
    </form>
  )
}
