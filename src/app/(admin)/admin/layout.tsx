import Link from "next/link"
import { Users, Database, LayoutDashboard, Settings, LogOut, CheckSquare, ShieldCheck, UserCog, ChevronDown } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignOutButton from "@/components/SignOutButton"
import PageTransition from "@/components/PageTransition"
import SidebarToggles from "@/components/SidebarToggles"

import AdminSidebar from "@/components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || "ALUMNI"

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <AdminSidebar session={session} role={role} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}
