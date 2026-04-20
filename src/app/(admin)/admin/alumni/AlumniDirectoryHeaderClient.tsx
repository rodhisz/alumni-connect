"use client"

import { useLanguage } from "@/components/Providers"

export default function AlumniDirectoryHeaderClient() {
  const { t, lang } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {lang === "id" ? "Direktori Alumni" : "Alumni Directory"}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">
        {lang === "id" 
          ? "Kelola data pendaftaran alumni, integrasi sistem, dan hak akses."
          : "Manage alumni registration data, system integration, and access rights."}
      </p>
    </div>
  )
}
