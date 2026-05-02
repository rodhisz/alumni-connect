"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Database, LayoutDashboard, Settings, UserCog, CheckSquare, ShieldCheck, AlertTriangle, Newspaper, Menu, X } from "lucide-react"
import { useLanguage } from "./Providers"
import SidebarToggles from "./SidebarToggles"
import SignOutButton from "./SignOutButton"
import NotificationBell from "./NotificationBell"

interface SidebarProps {
  session: any
  role: string
}

export default function AdminSidebar({ session, role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t, lang } = useLanguage()
  const pathname = usePathname()
  const menuItems = [
    { label: t("alumni_data"), href: "/admin/alumni", icon: Users, roles: ["SUPERUSER", "ADMIN", "ALUMNI"] },
    { 
      label: t("personal_data"), 
      href: role === "ALUMNI" ? `/admin/alumni/${session?.user?.id}` : "/admin/profile", 
      icon: UserCog, 
      roles: ["SUPERUSER", "ADMIN", "ALUMNI"] 
    },
    { label: t("approvals"), href: "/admin/approvals", icon: CheckSquare, roles: ["SUPERUSER", "ADMIN"] },
    { label: t("news"), href: "/admin/news", icon: Newspaper, roles: ["SUPERUSER", "ADMIN"] },
    { label: t("master_data"), href: "/admin/master", icon: Database, roles: ["SUPERUSER", "ADMIN"] },
    { label: lang === 'id' ? "Kembali ke Beranda" : "Back to Home", href: "/", icon: ShieldCheck, roles: ["SUPERUSER", "ADMIN", "ALUMNI"] },
  ]

  const settingItems = [
    { label: t("user_management"), href: "/admin/settings/users", icon: UserCog, roles: ["SUPERUSER"] },
    { label: lang === 'id' ? "Pengaturan Situs" : "Site Settings", href: "/admin/settings/site", icon: ShieldCheck, roles: ["SUPERUSER"] },
    { label: lang === 'id' ? "Widget Dashboard" : "Dashboard Widgets", href: "/admin/settings/widgets", icon: LayoutDashboard, roles: ["SUPERUSER"] },
    { label: t("approval_matrix"), href: "/admin/settings/approvals", icon: ShieldCheck, roles: ["SUPERUSER"] },
    { label: lang === 'id' ? "Pemeliharaan" : "Maintenance", href: "/admin/settings/maintenance", icon: AlertTriangle, roles: ["SUPERUSER"] },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-50 sticky top-0">
        <h2 className="text-xl font-outfit font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          Alumni Connect
        </h2>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-68 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 glass z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 pb-2 hidden md:flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-outfit font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Alumni Connect
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mt-1 flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded ${
                role === 'SUPERUSER' ? 'bg-emerald-500/20 text-emerald-600' :
                role === 'ADMIN' ? 'bg-amber-500/20 text-amber-600' :
                'bg-zinc-500/20 text-zinc-600'
              }`}>
                {role}
              </span> PORTAL
            </p>
          </div>
          <NotificationBell />
        </div>

        {/* Mobile App role badge since header lacks it */}
        <div className="md:hidden p-6 pb-2">
           <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded ${
                role === 'SUPERUSER' ? 'bg-emerald-500/20 text-emerald-600' :
                role === 'ADMIN' ? 'bg-amber-500/20 text-amber-600' :
                'bg-zinc-500/20 text-zinc-600'
              }`}>
                {role}
              </span> PORTAL
            </p>
        </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.filter(item => item.roles.includes(role)).map((item, i) => (
          <Link 
            key={i} 
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.href) 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-emerald-500"
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}

        {settingItems.some(item => item.roles.includes(role)) && (
          <div className="pt-4">
            <p className="px-4 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
               <Settings size={12} /> {t("settings")}
            </p>
            {settingItems.filter(item => item.roles.includes(role)).map((item, i) => (
              <Link 
                key={i} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href) 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-emerald-500"
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
      
      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <SidebarToggles />
        <div className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50">
           <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{session?.user?.name || "User"}</p>
           <p className="text-[10px] text-zinc-500 truncate">{session?.user?.email}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
    </>
  )
}
