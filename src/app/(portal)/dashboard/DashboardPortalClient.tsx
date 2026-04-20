"use client"

import Link from "next/link"
import { AlertCircle, CheckCircle2, Calendar as Clock, Edit2, MapPin, Briefcase, GraduationCap, UserCircle } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function DashboardPortalClient({ profile }: { profile: any }) {
  const { t, lang } = useLanguage()

  const isWaiting = profile.status === "WAITING"

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24 sm:pb-8">
      
      {/* Header Profile Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-zinc-900 dark:text-white">
            {lang === "id" ? "Halo" : "Hello"}, {profile.fullName.split(" ")[0]}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {lang === "id" 
              ? "Selamat datang di Portal Alumni. Pastikan data terkinimu selalu mutakhir."
              : "Welcome to Alumni Portal. Make sure your latest data is always updated."}
          </p>
        </div>
        
        {isWaiting ? (
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Clock size={18} />
            {t("waiting_approval")}
          </div>
        ) : (
          <Link 
            href="/dashboard/edit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Edit2 size={16} />
            {lang === "id" ? "Pengajuan Ubah Data" : "Request Data Change"}
          </Link>
        )}
      </div>

      {isWaiting && profile.revisions?.[0] && (
        <div className="mb-8 p-5 bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900 shadow-sm rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {lang === "id" ? "Proses Verifikasi" : "Verification Process"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {lang === "id" 
                  ? `Pengajuan perubahan data Anda pada ${new Date(profile.revisions[0].createdAt).toLocaleDateString("id-ID")} sedang dalam antrean pemeriksaan. Selama proses ini berlangsung, fungsi edit data dinonaktifkan sementara.`
                  : `Your data change request on ${new Date(profile.revisions[0].createdAt).toLocaleDateString("en-US")} is in the verification queue. During this process, data editing is temporarily disabled.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {profile.status === "REJECTED" && profile.revisions?.[0]?.adminNotes && (
         <div className="mb-8 p-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900 shadow-sm rounded-2xl">
         <div className="flex items-start gap-4">
           <div className="p-3 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-xl">
             <AlertCircle size={24} />
           </div>
           <div>
             <h3 className="font-semibold text-red-900 dark:text-red-100">
               {lang === "id" ? "Pembaruan Ditolak" : "Update Rejected"}
             </h3>
             <p className="text-sm text-red-700 dark:text-red-200 mt-1">
               {lang === "id" ? "Alasan" : "Reason"}: {profile.revisions[0].adminNotes}
             </p>
             <p className="text-xs text-red-600 dark:text-red-300 mt-2 font-medium">
               {lang === "id" ? "Silakan ajukan perubahan data kembali." : "Please submit data change again."}
             </p>
           </div>
         </div>
       </div>
      )}

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card: Pribadi & Kealumnian */}
        <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <UserCircle className="text-blue-500" size={20} />
            <h3 className="font-semibold font-outfit text-zinc-900 dark:text-white">{lang === "id" ? "Data Identitas" : "Identity Data"}</h3>
            {profile.status === "APPROVED" && (
              <span className="ml-auto text-emerald-500"><CheckCircle2 size={18} /></span>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("full_name")}</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("phone_number")}</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.phoneNumber || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("start_year")}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.startYear || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("graduation_year")}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.graduationYear || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Domisili */}
        <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <MapPin className="text-rose-500" size={20} />
            <h3 className="font-semibold font-outfit text-zinc-900 dark:text-white">{t("domicile")}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("domicile_type")}</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {profile.domicileType === "DOMESTIC" ? t("domestic") : profile.domicileType === "FOREIGN" ? t("foreign") : "-"}
              </p>
            </div>
            
            {profile.domicileType === "DOMESTIC" && (
              <>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("province")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.provinceName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("city")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.cityName || "-"}</p>
                </div>
              </>
            )}
            
            {profile.domicileType === "FOREIGN" && (
              <>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("country")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.countryName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("state")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.stateName || "-"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card: Pekerjaan & Pendidikan */}
        <div className="glass rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 md:col-span-2 flex flex-col gap-5">
           <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Briefcase className="text-emerald-500" size={20} />
            <h3 className="font-semibold font-outfit text-zinc-900 dark:text-white">{lang === "id" ? "Status Utama" : "Primary Status"}: {
              profile.activityStatus === "WORKING" ? t("working") : 
              profile.activityStatus === "COLLEGE" ? t("college") : 
              profile.activityStatus === "COLLEGE_AND_WORKING" ? t("college_and_working") : 
              profile.activityStatus === "GRADUATED_AND_WORKING" ? t("graduated_and_working") : "-"
            }</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pendidikan Details */}
            {(profile.activityStatus === "COLLEGE" || profile.activityStatus === "COLLEGE_AND_WORKING") ? (
              <div className="space-y-4 border-l-2 border-blue-500 pl-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <GraduationCap size={16}/> <span className="font-semibold text-xs uppercase">{lang === "id" ? "Studi Sedang Berjalan" : "Studies in Progress"}</span>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("university")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {profile.university?.name === "Lainnya" ? profile.otherUniversity : (profile.university?.name || "-")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("major")} / {t("college_level")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {profile.major?.name === "Lainnya" ? profile.otherMajor : (profile.major?.name || "-")} ({profile.collegeLevel?.name || "-"})
                  </p>
                </div>
              </div>
            ) : <div className="text-xs text-zinc-400 italic font-medium">{lang === "id" ? "Tidak ada keterangan perkuliahan aktif." : "No active college information."}</div>}

            {/* Pekerjaan Details */}
            {(profile.activityStatus === "WORKING" || profile.activityStatus === "COLLEGE_AND_WORKING" || profile.activityStatus === "GRADUATED_AND_WORKING") ? (
              <div className="space-y-4 border-l-2 border-emerald-500 pl-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <Briefcase size={16}/> <span className="font-semibold text-xs uppercase">{lang === "id" ? "Pekerjaan Saat Ini" : "Current Job"}</span>
                </div>
                <div>
                   <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("company")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.companyName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{t("job_position")} / {t("job_status")}</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{profile.jobPosition || "-"} ({profile.jobStatus?.name || "-"})</p>
                </div>
              </div>
            ) : <div className="text-xs text-zinc-400 italic font-medium">{lang === "id" ? "Tidak ada keterangan kerja aktif." : "No active work information."}</div>}
          </div>
        </div>

      </div>
    </div>
  )
}
