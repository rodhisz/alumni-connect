"use client"

import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 animate-pulse" />
        <div className="absolute inset-[-8px] rounded-full border-2 border-cyan-500/5 animate-ping" />
        
        {/* Main Loader */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative z-10">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">Memuat Data...</h3>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm max-w-xs mx-auto">
          Mohon tunggu sejenak sementara kami menyiapkan informasi untuk Anda.
        </p>
      </div>
      
      {/* Skeleton placeholders hint */}
      <div className="mt-12 w-full max-w-md px-4 space-y-4 opacity-20">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4 mx-auto animate-pulse" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  )
}
