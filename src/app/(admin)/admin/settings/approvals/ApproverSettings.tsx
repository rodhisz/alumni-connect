"use client"

import { useState } from "react"
import { addApproverEmail, removeApproverEmail } from "@/core/actions/settings"
import { ShieldCheck, Plus, Trash2, UserPlus, AlertCircle, Search } from "lucide-react"
import { useLanguage } from "@/components/Providers"

type UserItem = { email: string; name: string | null; role: string }
type ApproverItem = { id: string; name: string; isActive: boolean; createdAt: Date }

export default function ApproverSettings({ 
  users, 
  approvers 
}: { 
  users: UserItem[], 
  approvers: ApproverItem[] 
}) {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedEmail, setSelectedEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const { t, lang } = useLanguage()

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmail) return

    setLoading(true)
    setErrorMsg("")

    const res = await addApproverEmail(selectedEmail)
    if (res.success) {
      setSelectedEmail("")
      setSearch("")
    } else {
      setErrorMsg(res.error || (lang === "id" ? "Gagal menambahkan approver" : "Failed to add approver"))
    }
    setLoading(false)
  }

  const handleRemove = async (id: string, email: string) => {
    if (!confirm(`Hapus akses fitur Admin (Approver) untuk ${email}?`)) return
    
    const res = await removeApproverEmail(id)
    if (!res.success) {
      alert(res.error || "Gagal menghapus approver")
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Management Card */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <ShieldCheck className="text-emerald-500" size={24} />
          <div>
            <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">
              {lang === "id" ? "Otorisasi Admin / Approver" : "Admin / Approver Authorization"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {lang === "id" 
                ? "Daftar email yang diikutsertakan ke sini otomatis mendapatkan privilese layaknya seorang Administrator tanpa batas."
                : "Email addresses registered here automatically receive unlimited Administrator privileges."}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex gap-3 items-center text-sm">
            <AlertCircle size={18} />
            {errorMsg}
          </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleAdd} className="mb-8 p-5 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-2xl">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            {lang === "id" ? "Tambahkan Akses Baru" : "Add New Access"}
          </label>
          <div className="flex flex-col md:flex-row gap-3 relative">
            <div className="relative flex-1 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
               <input 
                 type="text"
                 placeholder={lang === "id" ? "Ketik nama atau email user..." : "Type user name or email..."}
                 value={search || selectedEmail}
                 onChange={(e) => {
                   setSearch(e.target.value)
                   setSelectedEmail(e.target.value) 
                 }}
                 className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
               />
               
               {/* Dropdown Results */}
               {search && (
                 <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 p-2 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                   {filteredUsers.length === 0 ? (
                     <div className="p-3 text-sm text-zinc-500 text-center">
                       {lang === "id" ? "User tidak ditemukan. Anda tetap bisa mendaftarkan email tersebut." : "User not found. You can still register this email."}
                     </div>
                   ) : (
                     filteredUsers.slice(0, 5).map((u, i) => (
                       <button
                         key={i}
                         type="button"
                         onMouseDown={() => {
                           setSelectedEmail(u.email)
                           setSearch(u.name ? `${u.name} (${u.email})` : u.email)
                         }}
                         className="flex flex-col items-start w-full p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-left"
                       >
                         <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{u.name || (lang === "id" ? "Tanpa Nama" : "Unnamed")}</span>
                         <span className="text-xs text-zinc-500">{u.email} • Role: {u.role}</span>
                       </button>
                     ))
                   )}
                 </div>
               )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !selectedEmail}
              className="px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus size={18} /> {lang === "id" ? "Daftarkan" : "Register"}
            </button>
          </div>
        </form>

        {/* Existing Approvers List */}
        <div>
           <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 px-2 tracking-wide uppercase">
             {lang === "id" ? "Daftar Aktif" : "Active List"} ({approvers.length})
           </h3>
           <div className="space-y-2">
             {approvers.length === 0 ? (
               <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                 {lang === "id" ? "Belum ada approver tambahan yang didaftarkan." : "No additional approvers registered yet."}
               </div>
             ) : (
               approvers.map((appr) => (
                 <div key={appr.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                       {appr.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{appr.name}</p>
                       <p className="text-xs text-zinc-500">
                         {lang === "id" ? "Ditambahkan" : "Added"}: {new Date(appr.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US")}
                       </p>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => handleRemove(appr.id, appr.name)}
                     className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                     title={lang === "id" ? "Cabut Akses" : "Revoke Access"}
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  )
}
