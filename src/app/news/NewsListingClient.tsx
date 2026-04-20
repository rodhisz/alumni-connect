"use client"

import { useLanguage } from "@/components/Providers"
import Link from "next/link"
import { Calendar, User, ArrowRight, Newspaper, ChevronLeft } from "lucide-react"

export default function NewsListingClient({ news }: { news: any[] }) {
  const { t, lang } = useLanguage()

  return (
    <div className="max-w-7xl mx-auto px-6">
        <Link 
          href="/"
          className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all mb-12 w-fit"
        >
          <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight uppercase">{t("back")}</span>
        </Link>

        <div className="mb-16 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Alumni Insights</h2>
            <h1 className="text-5xl font-outfit font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                {t("news")}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg font-medium">
                {lang === 'id' 
                  ? "Jelajahi informasi terbaru, cerita sukses, dan pembaruan penting dari komunitas alumni kami di seluruh dunia."
                  : "Explore the latest information, success stories, and important updates from our alumni community around the world."}
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {news.map((item: any) => (
            <Link 
              href={`/news/${item.slug}`} 
              key={item.id} 
              className="group flex flex-col glass-premium rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-all duration-500 bg-white/50 dark:bg-zinc-900/50"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <Newspaper size={48} className="opacity-20" />
                  </div>
                )}
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    {item.author.name}
                  </div>
                </div>

                <h3 className="text-2xl font-outfit font-black text-zinc-900 dark:text-white leading-tight mb-6 group-hover:text-blue-500 transition-colors line-clamp-3">
                  {item.title}
                </h3>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 uppercase">
                   {t("read_more")}
                   <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {news.length === 0 && (
          <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
             <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper size={32} className="text-zinc-400" />
             </div>
             <p className="text-zinc-500 font-bold">{t("no_data")}</p>
          </div>
        )}
    </div>
  )
}
