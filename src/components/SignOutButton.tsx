"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { useLanguage } from "./Providers"

export default function SignOutButton() {
  const { t } = useLanguage()
  return (
    <button 
      onClick={() => signOut()}
      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
    >
      <LogOut size={20} />
      <span className="font-medium text-sm">{t("logout")}</span>
    </button>
  )
}
