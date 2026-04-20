"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Key, ShieldCheck, User as UserIcon, Trash2, KeyRound, UserCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { adminChangePassword, deleteUser, updateUserRole, getAllUsers } from "@/core/actions/users"
import { useConfirm } from "@/components/ConfirmProvider"
import { UserRole } from "@prisma/client"
import { useLanguage } from "@/components/Providers"

type UserItem = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
}

export default function UserManagementTable({ initialResponse }: { initialResponse: any }) {
  const [data, setData] = useState<UserItem[]>(initialResponse.data || [])
  const [pagination, setPagination] = useState(initialResponse.pagination)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { confirm } = useConfirm()
  const { t, lang } = useLanguage()
  
  // Password Change Modal State
  const [resetModal, setResetModal] = useState<UserItem | null>(null)
  const [newPassword, setNewPassword] = useState("")

  // Role Change Modal State
  const [roleModal, setRoleModal] = useState<UserItem | null>(null)

  const fetchData = useCallback(async (p: number, s: string) => {
    setLoading(true)
    const res = await getAllUsers(p, 10, s)
    if (res.success) {
      setData(res.data)
      setPagination(res.pagination)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, search)
    }, 500)
    return () => clearTimeout(timer)
  }, [page, search, fetchData])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModal || newPassword.length < 6) return
    
    setLoading(true)
    const res = await adminChangePassword(resetModal.id, newPassword)
    if (res.success) {
      alert((lang === "id" ? "Password berhasil diubah untuk " : "Password changed for ") + resetModal.email)
      setResetModal(null)
      setNewPassword("")
    } else {
      alert(res.error || (lang === "id" ? "Gagal mengubah password" : "Failed to change password"))
    }
    setLoading(false)
  }

  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!roleModal) return
    setLoading(true)
    const res = await updateUserRole(roleModal.id, newRole)
    if (res.success) {
      setData(data.map(u => u.id === roleModal.id ? { ...u, role: newRole } : u))
      setRoleModal(null)
    } else {
      alert(res.error || "Gagal mengubah role")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, email: string) => {
    confirm({
      title: lang === "id" ? "Hapus Akun User?" : "Delete User Account?",
      message: lang === "id" 
        ? `Tindakan ini akan menghapus akun ${email} secara permanen. Data profil alumni yang terkait juga akan terhapus.`
        : `This will permanently delete the account ${email}. All associated alumni data will also be deleted.`,
      confirmText: lang === "id" ? "Ya, Hapus Akun" : "Yes, Delete Account",
      type: "danger",
      onConfirm: async () => {
        const res = await deleteUser(id)
        if (res.success) {
          fetchData(page, search)
        } else {
          alert(res.error)
        }
      }
    })
  }

  return (
    <div className="glass rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-black/20">
        <div className="relative w-full md:w-96">
          {loading ? (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          )}
          <input 
            type="text" 
            placeholder={lang === "id" ? "Cari email atau nama..." : "Search email or name..."} 
            value={search}
            onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px] relative">
        {loading && (
            <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
              <th className="p-4">{t("identity")}</th>
              <th className="p-4">{t("role_system")}</th>
              <th className="p-4">{t("reg_date")}</th>
              <th className="p-4 text-right">{t("security_management")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">Tidak ada user ditemukan.</td>
              </tr>
            ) : data.map(user => (
              <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {user.name || (lang === "id" ? "Tanpa Nama" : "Unnamed")}
                  </div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => setRoleModal(user)}
                    className={`px-2 py-1 flex items-center justify-center gap-1 w-fit rounded-lg text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${
                    user.role === 'SUPERUSER' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" :
                    user.role === 'ADMIN' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                  title={lang === "id" ? "Klik untuk ubah role" : "Click to change role"}
                >
                    {user.role === 'SUPERUSER' ? <ShieldCheck size={14}/> : 
                     user.role === 'ADMIN' ? <ShieldCheck size={14}/> : <UserIcon size={14}/>} {user.role}
                  </button>
                </td>
                <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setResetModal(user)} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-900"
                  >
                    <KeyRound size={14} /> {t("change_password")}
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id, user.email)} 
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title={lang === "id" ? "Hapus Akun Permanen" : "Delete Account Permanently"}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50 dark:bg-black/10">
        <div className="text-xs text-zinc-500 font-medium">
          {lang === 'id' ? `Menampilkan ${data.length} dari ${pagination?.total || 0} user` : `Showing ${data.length} of ${pagination?.total || 0} users`}
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, pagination?.totalPages || 0))].map((_, i) => {
              let pNum = 1;
              if (pagination.totalPages <= 5) pNum = i + 1;
              else if (page <= 3) pNum = i + 1;
              else if (page >= pagination.totalPages - 2) pNum = pagination.totalPages - 4 + i;
              else pNum = page - 2 + i;

              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${
                      page === pNum 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg" 
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
                  }`}
                >
                  {pNum}
                </button>
              )
            })}
          </div>

          <button 
            disabled={page >= (pagination?.totalPages || 1) || loading}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {resetModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-sm shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-outfit text-zinc-900 dark:text-white flex items-center gap-2 text-blue-600">
              <Key size={24} /> {t("reset_password")}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 mb-4">
              {lang === "id" 
                ? <>Ubah password untuk user <strong className="text-zinc-800 dark:text-zinc-200">{resetModal.email}</strong> secara instan.</>
                : <>Change password for <strong className="text-zinc-800 dark:text-zinc-200">{resetModal.email}</strong> instantly.</>}
            </p>
            
            <form onSubmit={handleResetPassword}>
               <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase">{t("new_password")}</label>
               <input 
                 type="password"
                 value={newPassword}
                 onChange={e => setNewPassword(e.target.value)}
                 placeholder={lang === "id" ? "Minimal 6 karakter..." : "Min 6 characters..."}
                 className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm mb-6"
                 required
                 minLength={6}
               />
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setResetModal(null)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >{t("cancel")}</button>
                <button 
                  type="submit" 
                  disabled={loading || newPassword.length < 6}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
                >{t("force_change")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {roleModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] w-full max-w-sm shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-outfit text-zinc-900 dark:text-white flex items-center gap-2 text-purple-600">
              <UserCheck size={24} /> {t("change_access")}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              {lang === "id" ? "Pilih level akses untuk " : "Select access level for "}
              <strong className="text-zinc-800 dark:text-zinc-200">{roleModal.email}</strong>
            </p>
            
            <div className="space-y-3">
              {[
                { val: "SUPERUSER", label: "Super User", desc: t("superuser_desc") },
                { val: "ADMIN", label: "Admin", desc: t("admin_desc") },
                { val: "ALUMNI", label: "Alumni", desc: t("alumni_desc") }
              ].map((r) => (
                <button
                  key={r.val}
                  onClick={() => handleRoleUpdate(r.val as UserRole)}
                  disabled={loading}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:border-purple-500/50 ${
                    roleModal.role === r.val ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20" : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.label}</p>
                  <p className="text-xs text-zinc-500">{r.desc}</p>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setRoleModal(null)}
              className="w-full mt-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
