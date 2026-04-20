"use client"

import { useLanguage } from "@/components/Providers"
import Link from "next/link"
import { Calendar, User, ChevronLeft, Share2, Bookmark } from "lucide-react"

export default function NewsDetailClient({ news }: { news: any }) {
  const { t, lang } = useLanguage()

  return (
    <article className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb */}
        <Link 
          href="/news"
          className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all mb-12 w-fit"
        >
          <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight uppercase">{lang === 'id' ? "Kembali ke Berita" : "Back to News"}</span>
        </Link>

        {/* Header */}
        <header className="space-y-8 mb-16">
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <Calendar size={12} className="text-blue-500" />
                    {new Date(news.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <User size={12} className="text-purple-500" />
                    {news.author.name}
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-outfit font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                {news.title}
            </h1>

            <div className="flex items-center justify-between py-6 border-y border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                        {news.author.name[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{news.author.name}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                            {lang === 'id' ? "Kontributor Alumni" : "Alumni Contributor"}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-blue-500 transition-colors border border-zinc-100 dark:border-zinc-800">
                        <Share2 size={20} />
                    </button>
                    <button className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 hover:text-blue-500 transition-colors border border-zinc-100 dark:border-zinc-800">
                        <Bookmark size={20} />
                    </button>
                </div>
            </div>
        </header>

        {/* Featured Image */}
        {news.image && (
          <div className="mb-16 -mx-6 md:-mx-12 lg:-mx-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-zinc-200 dark:border-zinc-800">
            <img 
              src={news.image} 
              alt={news.title} 
              className="w-full h-auto object-cover max-h-[600px]" 
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-headings:font-outfit prose-headings:font-black prose-headings:tracking-tight prose-strong:text-zinc-900 dark:prose-strong:text-white">
          {news.content.split('\n').map((para: string, i: number) => (
            para.trim() && <p key={i} className="mb-6">{para}</p>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-500/5">
                <div className="space-y-2">
                    <h4 className="text-xl font-outfit font-black text-zinc-900 dark:text-white">
                        {lang === 'id' ? "Terhubung Kembali?" : "Reconnect?"}
                    </h4>
                    <p className="text-sm text-zinc-500 font-medium">
                        {lang === 'id' 
                            ? "Jangan lewatkan pembaruan menarik lainnya dari almamater Anda." 
                            : "Don't miss other exciting updates from your alma mater."}
                    </p>
                </div>
                <Link 
                    href="/admin"
                    className="px-8 py-3.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {lang === 'id' ? "Masuk ke Portal" : "Login to Portal"}
                </Link>
            </div>
        </footer>
    </article>
  )
}
