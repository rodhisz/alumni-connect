import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, UserCircle, Map } from "lucide-react"
import SidebarToggles from "@/components/SidebarToggles"

import PortalHeader from "@/components/PortalHeader"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ALUMNI") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      <PortalHeader session={session} />

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-around z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-600">
          <UserCircle size={20} />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
        <Link href="/" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-600">
          <Map size={20} />
          <span className="text-[10px] font-medium">Peta</span>
        </Link>
      </div>
    </div>
  )
}
