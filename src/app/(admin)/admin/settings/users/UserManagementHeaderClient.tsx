"use client"

import { UserCog } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function UserManagementHeaderClient() {
  const { t, lang } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
        <UserCog size={32} className="text-zinc-400" /> {t("user_management")}
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1">
        {lang === "id" 
          ? "Daftar seluruh akun di dalam sistem terlepas dari perannya. Bisa mengganti password tanpa sandi lama."
          : "List of all system accounts regardless of role. Password reset available without current password."}
      </p>
    </div>
  )
}
