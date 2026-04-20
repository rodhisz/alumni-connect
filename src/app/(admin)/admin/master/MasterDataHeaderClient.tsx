"use client"

import { useLanguage } from "@/components/Providers"

export default function MasterDataHeaderClient() {
  const { t, lang } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {t("master_data")}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">
        {lang === "id" 
          ? "Konfigurasi opsi dinamis untuk seluruh dropdown formulir alumni."
          : "Configure dynamic options for all alumni form dropdowns."}
      </p>
    </div>
  )
}
