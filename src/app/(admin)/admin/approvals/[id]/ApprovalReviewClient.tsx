"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveRevision, rejectRevision } from "@/core/actions/approvals"
import { UserCircle, MapPin, Briefcase, GraduationCap, CheckCircle2, XCircle } from "lucide-react"
import { useLanguage } from "@/components/Providers"

// Comparing logic for UI indicator
const DiffView = ({ label, oldVal, newVal }: { label: string, oldVal: any, newVal: any }) => {
  const hasChanged = String(oldVal || "") !== String(newVal || "")
  if (!newVal && !oldVal) return null

  return (
    <div className="py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-xs font-semibold text-zinc-500 uppercase w-1/3 shrink-0">{label}</span>
      {hasChanged ? (
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-medium text-red-500 line-through opacity-70">{oldVal || "-"}</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-md">
            {newVal || "-"}
          </span>
        </div>
      ) : (
        <div className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{oldVal || "-"}</div>
      )}
    </div>
  )
}

export default function ApprovalReviewClient({ revision, canApprove }: { revision: any, canApprove: boolean }) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [approveModal, setApproveModal] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    const res = await approveRevision(revision.id)
    if (res.success) {
      router.push("/admin/approvals")
    } else {
      alert(res.error)
      setLoading(false)
      setApproveModal(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectReason.trim()) return alert(lang === "id" ? "Alasan penolakan wajib diisi." : "Rejection reason is required.")
    
    setLoading(true)
    const res = await rejectRevision(revision.id, rejectReason)
    if (res.success) {
      router.push("/admin/approvals")
    } else {
      alert(res.error)
      setLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        
        {/* Identitas Diri */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
            <UserCircle className="text-blue-500" size={24} />
            <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">{t("section_personal")}</h2>
          </div>
          <div className="flex flex-col">
            <DiffView label={t("full_name")} oldVal={revision.profile.fullName} newVal={revision.fullName} />
            <DiffView label={t("phone_number")} oldVal={revision.profile.phoneNumber} newVal={revision.phoneNumber} />
            <DiffView label={t("citizenship")} oldVal={revision.profile.citizenship} newVal={revision.citizenship} />
            <DiffView label={lang === "id" ? "Jenis Kelamin" : "Gender"} oldVal={revision.profile.isMale === null ? null : (revision.profile.isMale ? (lang === "id" ? "Putra" : "Male") : (lang === "id" ? "Putri" : "Female"))} newVal={revision.isMale === null ? null : (revision.isMale ? (lang === "id" ? "Putra" : "Male") : (lang === "id" ? "Putri" : "Female"))} />
            <DiffView label={t("marital_status")} 
              oldVal={revision.profile.maritalStatus?.name} 
              newVal={revision.maritalStatus?.name} 
            />
            <DiffView label={t("start_year")} oldVal={revision.profile.startYear} newVal={revision.startYear} />
            <DiffView label={t("graduation_year")} oldVal={revision.profile.graduationYear} newVal={revision.graduationYear} />
            <DiffView label={t("highest_education")} oldVal={revision.profile.highestEducation} newVal={revision.highestEducation} />
            <DiffView label={t("entry_level")} 
              oldVal={revision.profile.entryLevel?.name} 
              newVal={revision.entryLevel?.name} 
            />
            <DiffView label={t("graduation_status")} 
              oldVal={revision.profile.graduationStatus?.name} 
              newVal={revision.graduationStatus?.name} 
            />
          </div>
        </div>

        {/* Domisili */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
            <MapPin className="text-rose-500" size={24} />
            <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">{t("domicile")}</h2>
          </div>
          <div className="flex flex-col">
            <DiffView label={t("domicile_type")} oldVal={revision.profile.domicileType} newVal={revision.domicileType} />
            <DiffView label={t("province")} oldVal={revision.profile.provinceName} newVal={revision.provinceName} />
            <DiffView label={t("city")} oldVal={revision.profile.cityName} newVal={revision.cityName} />
            <DiffView label={t("country")} oldVal={revision.profile.countryName} newVal={revision.countryName} />
            <DiffView label={t("state")} oldVal={revision.profile.stateName} newVal={revision.stateName} />
          </div>
        </div>

        {/* Kegiatan */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
           <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
            <Briefcase className="text-emerald-500" size={24} />
            <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white">{t("section_activity")}</h2>
          </div>
          <div className="flex flex-col">
            <DiffView label={t("activity_status")} oldVal={revision.profile.activityStatus} newVal={revision.activityStatus} />
            
            <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-blue-500 font-semibold mb-2">{lang === "id" ? "Perkuliahan" : "College"}</p>
              <DiffView label={t("university")} 
                oldVal={revision.profile.university?.name === "Lainnya" ? revision.profile.otherUniversity : revision.profile.university?.name} 
                newVal={revision.university?.name === "Lainnya" ? revision.otherUniversity : revision.university?.name} 
              />
              <DiffView label={t("college_level")} oldVal={revision.profile.collegeLevel?.name} newVal={revision.collegeLevel?.name} />
              <DiffView label={t("major")} 
                oldVal={revision.profile.major?.name === "Lainnya" ? revision.profile.otherMajor : revision.profile.major?.name} 
                newVal={revision.major?.name === "Lainnya" ? revision.otherMajor : revision.major?.name} 
              />
              <DiffView label={t("college_status")} oldVal={revision.profile.collegeStatus?.name} newVal={revision.collegeStatus?.name} />
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-emerald-500 font-semibold mb-2">{lang === "id" ? "Pekerjaan" : "Work"}</p>
              <DiffView label={t("company")} oldVal={revision.profile.companyName} newVal={revision.companyName} />
              <DiffView label={t("job_position")} oldVal={revision.profile.jobPosition} newVal={revision.jobPosition} />
              <DiffView label={t("job_status")} oldVal={revision.profile.jobStatus?.name} newVal={revision.jobStatus?.name} />
            </div>
          </div>
        </div>

      </div>

      {canApprove ? (
        <div className="sticky bottom-4 z-40 mt-8 p-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-end gap-4 shadow-2xl">
          <button 
            onClick={() => setRejectModal(true)}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            <XCircle size={18} /> {t("reject")}
          </button>
          <button 
            onClick={() => setApproveModal(true)}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={18} /> {t("approve")}
          </button>
        </div>
      ) : (
        <div className="sticky bottom-4 z-40 mt-8 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-900/50 rounded-2xl flex justify-center shadow-lg">
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Anda bukan bagian dari Approval Matrix. Hak akses untuk mengesahkan data dimatikan.
          </p>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full scale-110">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">
                {lang === "id" ? "Konfirmasi Pengesahan" : "Confirm Approval"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {lang === "id" 
                  ? <>Anda akan mengesahkan perubahan data untuk <span className="font-semibold text-zinc-900 dark:text-zinc-100">{revision.fullName || revision.profile.fullName}</span>. Data ini akan langsung diperbarui ke profil alumni.</>
                  : <>You are about to approve data changes for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{revision.fullName || revision.profile.fullName}</span>. This will update the alumni public profile immediately.</> 
                }
              </p>
            </div>
            
            <div className="pt-8 flex gap-3">
              <button type="button" onClick={() => setApproveModal(false)} className="flex-1 px-4 py-3.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-2xl transition-all">
                {t("cancel")}
              </button>
              <button type="button" onClick={handleApprove} disabled={loading} className="flex-1 px-4 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                {loading ? t("processing") : (lang === "id" ? "Ya, Sahkan Data" : "Yes, Approve")}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200 relative">
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full scale-110">
                <XCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">
                {lang === "id" ? "Konfirmasi Penolakan" : "Confirm Rejection"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                {lang === "id" ? "Berikan alasan penolakan agar alumni dapat memahami bagian data mana yang perlu diperbaiki." : "Provide a rejection reason so the alumni understands what to correct."}
              </p>
            </div>
            
            <form onSubmit={handleReject} className="space-y-6">
              <textarea 
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder={lang === "id" ? "Contoh: Nama instansi belum lengkap..." : "e.g. Company name is incomplete..."}
                className="w-full h-32 px-4 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm resize-none transition-all"
                required
              />
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setRejectModal(false)} className="flex-1 px-4 py-3.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 rounded-2xl transition-all">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                  {loading ? t("processing") : t("reject")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
