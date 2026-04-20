"use client"

import { Settings as SettingsIcon } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function SettingsHeaderClient() {
  const { t, lang } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
        <SettingsIcon size={32} className="text-zinc-400" /> {t("system_settings")}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">
        {lang === "id" 
          ? "Konfigurasi akses keamanan dan preferensi admin platform Alumni Connect."
          : "Configure security access and admin preferences for Alumni Connect platform."}
      </p>
    </div>
  )
}
