"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react"
import { useLanguage } from "./Providers"

type ConfirmOptions = {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info" | "success"
  onConfirm: () => void | Promise<void>
}

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t, lang } = useLanguage()

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }

  const handleClose = () => {
    if (loading) return
    setIsOpen(false)
    setTimeout(() => setOptions(null), 300)
  }

  const handleConfirm = async () => {
    if (!options) return
    setLoading(true)
    try {
      await options.onConfirm()
      setIsOpen(false)
      setTimeout(() => setOptions(null), 300)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = () => {
    switch (options?.type) {
      case "danger": return <AlertTriangle className="text-red-500" size={32} />
      case "success": return <CheckCircle2 className="text-emerald-500" size={32} />
      case "info": return <Info className="text-blue-500" size={32} />
      default: return <AlertTriangle className="text-amber-500" size={32} />
    }
  }

  const getButtonClass = () => {
    switch (options?.type) {
      case "danger": return "bg-red-600 hover:bg-red-700 shadow-red-500/20"
      case "success": return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
      case "info": return "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
      default: return "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
    }
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full bg-zinc-100 dark:bg-zinc-800/50 mb-2`}>
                {getIcon()}
              </div>
              <h3 className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">
                {options.title}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {options.message}
              </p>
            </div>
            
            <div className="pt-8 flex gap-3">
              <button 
                type="button" 
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-2xl transition-all disabled:opacity-50"
              >
                {options.cancelText || t("cancel")}
              </button>
              <button 
                type="button" 
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all shadow-lg disabled:opacity-50 ${getButtonClass()}`}
              >
                {loading ? t("processing") : (options.confirmText || t("confirm"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider")
  return context
}
