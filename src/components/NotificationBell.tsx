"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, X, ExternalLink, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { getNotifications, markAsRead, markAllAsRead } from "@/core/actions/notifications"
import { useLanguage } from "./Providers"
import Link from "next/link"

export default function NotificationBell() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifs = async () => {
    const res = await getNotifications()
    if (res.success && res.data) {
      setNotifications(res.data)
      setUnreadCount(res.data.filter((n: any) => !n.isRead).length)
    }
  }

  useEffect(() => {
    fetchNotifs()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifs, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await markAsRead(id)
    fetchNotifs()
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    fetchNotifs()
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "SUCCESS": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "WARNING": return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
      case "DANGER": return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
      case "APPROVAL_REQUEST": return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle2 size={14} />
      case "DANGER": return <AlertCircle size={14} />
      case "APPROVAL_REQUEST": return <ExternalLink size={14} />
      default: return <Info size={14} />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-95"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-4 w-80 max-h-[32rem] overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[100] animate-in zoom-in-95 duration-200 origin-top-left">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="font-outfit font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">{t("notifications")}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg transition-colors"
              >
                {t("mark_all_read")}
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[24rem] py-2">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4 opacity-20" />
                <p className="text-sm text-zinc-400 font-medium">{t("no_notifications")}</p>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((notif) => (
                  <div 
                    key={notif.id}
                    className={`px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors relative group border-b border-zinc-50 dark:border-zinc-800 last:border-0 ${!notif.isRead ? "bg-blue-50/10 dark:bg-blue-900/5" : ""}`}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-1 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${getTypeStyle(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-xs font-bold leading-tight mb-1 truncate ${!notif.isRead ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-normal mb-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] text-zinc-400 font-medium">
                             {new Date(notif.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {notif.link && (
                             <Link 
                              href={notif.link}
                              onClick={() => setIsOpen(false)}
                              className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                             >
                               Buka <ExternalLink size={8} />
                             </Link>
                           )}
                        </div>
                      </div>
                    </div>
                    
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="absolute top-4 right-4 p-1 text-zinc-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                {notifications.length > 5 && (
                  <Link 
                    href="/admin/notifications" 
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-center text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    Lihat Semua ({notifications.length})
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
