"use client"

import Link from "next/link"
import { 
  ChevronLeft, Edit, Mail, Phone, Calendar, MapPin, 
  Briefcase, GraduationCap, Building2, UserCircle, 
  Heart, Globe, Flag, CheckCircle2, Award, Zap, 
  Navigation, Building, Clock, AlertTriangle
} from "lucide-react"
import { useLanguage } from "@/components/Providers"
import { EDUCATION_LABELS } from "@/lib/constants"

export default function AlumniDetailClient({ id, user, role, currentUserId }: { id: string, user: any, role: string, currentUserId?: string }) {
  const { t, lang } = useLanguage()
  const isAdmin = role === "SUPERUSER" || role === "ADMIN"
  const isAlumni = role === "ALUMNI"
  const profile = user.profile

  const InfoCard = ({ icon: Icon, title, value, className = "", colorClass = "text-blue-500 bg-blue-50 dark:bg-blue-900/20" }: any) => (
    <div className={`group p-5 rounded-[2rem] bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md border border-white/50 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 flex items-start gap-4 ${className}`}>
      <div className={`p-3 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-[0.1em]">{title}</div>
        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{value || "-"}</div>
      </div>
    </div>
  )

  const SectionHeading = ({ icon: Icon, children, color = "text-blue-500" }: any) => (
    <div className="relative mb-8 pt-4">
      <h2 className={`text-xl font-outfit font-black ${color} flex items-center gap-3`}>
        <div className={`p-2 rounded-xl bg-current opacity-10 absolute -left-2 -top-2 w-12 h-12 -z-10`} />
        <Icon size={24} /> 
        <span className="text-zinc-900 dark:text-white">{children}</span>
      </h2>
      <div className="h-1 w-20 bg-gradient-to-r from-current to-transparent mt-2 rounded-full opacity-20" />
    </div>
  )

  const getEducationLabel = (edu: string) => {
    if (!edu) return "-"
    return EDUCATION_LABELS[edu]?.[lang] || edu
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/admin/alumni" 
          className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="font-bold text-sm tracking-tight">
            {lang === "id" ? "Kembali ke Daftar" : "Back to Directory"}
          </span>
        </Link>
        
        {(isAdmin || currentUserId === id) && (
          <Link 
            href={`/admin/alumni/${id}/edit`}
            className="relative group overflow-hidden flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-2xl shadow-zinc-500/20 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Edit size={18} className="relative z-10" />
            <span className="relative z-10">{lang === "id" ? "Sunting Profil" : "Edit Profile"}</span>
          </Link>
        )}
      </div>

      {/* Alumni Status Flag/Banner */}
      {isAlumni && profile?.status !== 'APPROVED' && (
        <div className={`mb-12 p-6 rounded-[2.5rem] border animate-in slide-in-from-top duration-500 flex flex-col md:flex-row items-center gap-6 ${
          profile?.status === 'WAITING' 
            ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400"
            : "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400"
        }`}>
          <div className={`p-4 rounded-2xl ${
            profile?.status === 'WAITING' ? "bg-amber-200/50 dark:bg-amber-500/20" : "bg-red-200/50 dark:bg-red-500/20"
          }`}>
             {profile?.status === 'WAITING' ? <Clock size={32} /> : <AlertTriangle size={32} />}
          </div>
          <div className="text-center md:text-left flex-1">
             <h3 className="text-xl font-outfit font-black mb-1">
                {profile?.status === 'WAITING' 
                  ? (lang === "id" ? "Profil Menunggu Verifikasi" : "Profile Awaiting Verification")
                  : (lang === "id" ? "Profil Perlu Perbaikan" : "Profile Needs Correction")
                }
             </h3>
             <p className="text-sm opacity-80 font-medium leading-relaxed">
                {profile?.status === 'WAITING'
                  ? (lang === "id" ? "Data Anda sedang ditinjau oleh tim admin. Anda akan menerima notifikasi jika profile Anda sudah aktif di peta global." : "Your data is under review by the admin team. You will be notified once your profile is live on the global map.")
                  : (lang === "id" ? `Admin menolak pembaruan data Anda. Alasan: "${profile.rejectionNotes || t("no_data")}"` : `Admin rejected your update. Reason: "${profile.rejectionNotes || t("no_data")}"`)
                }
             </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Profile Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r ${profile?.isMale ? 'from-blue-500 to-indigo-500' : 'from-pink-400 to-rose-400'} rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
            <div className="relative glass-premium p-10 rounded-[2.5rem] text-center border border-white/50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-2xl overflow-hidden">
               {/* Decorative Background */}
               <div className={`absolute -top-20 -right-20 w-40 h-40 ${profile?.isMale ? 'bg-blue-500/10' : 'bg-pink-500/10'} rounded-full blur-3xl`} />
               <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${profile?.isMale ? 'bg-indigo-500/10' : 'bg-rose-500/10'} rounded-full blur-3xl`} />
               
               <div className="relative inline-block mb-6">
                 <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${profile?.isMale ? 'from-blue-500 to-indigo-600' : 'from-pink-400 to-rose-500'} p-1 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="w-full h-full rounded-[2.3rem] bg-white dark:bg-zinc-900 flex items-center justify-center text-5xl font-black font-outfit text-zinc-900 dark:text-white">
                      {user.name?.[0] || "?"}
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-700">
                   <Zap size={20} className="text-amber-500" />
                 </div>
               </div>

               <h1 className="text-2xl font-outfit font-black text-zinc-900 dark:text-white mb-2 tracking-tight">{user.name}</h1>
               <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">{user.email}</p>
               
               <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase border ${
                  profile?.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  profile?.status === 'WAITING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  profile?.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" :
                  "bg-zinc-100 text-zinc-500 border-zinc-200"
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    profile?.status === 'APPROVED' ? "bg-emerald-500" : 
                    profile?.status === 'REJECTED' ? "bg-red-500" : 
                    "bg-amber-500"
                  }`} />
                  {profile?.status || "DRAFT"}
               </div>

               {profile?.status === 'REJECTED' && (
                 <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 text-left">
                   <p className="text-[10px] font-black uppercase text-red-600 mb-1 tracking-wider">Alasan Penolakan:</p>
                   <p className="text-xs text-red-700 dark:text-red-400 font-medium leading-relaxed italic">
                     "{profile.rejectionNotes || "Tidak ada alasan spesifik."}"
                   </p>
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <InfoCard icon={UserCircle} title={lang === "id" ? "Nama Lengkap" : "Full Name"} value={profile?.fullName} colorClass="text-indigo-500 bg-indigo-50" />
            <InfoCard icon={UserCircle} title={lang === "id" ? "Jenis Kelamin" : "Gender"} value={profile?.isMale ? (lang === 'id' ? 'Putra' : 'Male') : (lang === 'id' ? 'Putri' : 'Female')} colorClass={profile?.isMale ? "text-blue-500 bg-blue-50" : "text-pink-500 bg-pink-50"} />
            <InfoCard icon={Mail} title="Email" value={user.email} colorClass="text-rose-500 bg-rose-50" />
            <InfoCard icon={Phone} title={lang === "id" ? "Nomor Telepon" : "Phone Number"} value={profile?.phoneNumber} colorClass="text-emerald-500 bg-emerald-50" />
            <InfoCard icon={Heart} title={lang === "id" ? "Status Marital" : "Marital Status"} value={profile?.maritalStatus?.name} colorClass="text-pink-500 bg-pink-50" />
            <InfoCard icon={Flag} title={lang === "id" ? "Kewarganegaraan" : "Citizenship"} value={profile?.citizenship} colorClass="text-amber-500 bg-amber-50" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-16">
          {/* Education Header */}
          <section className="relative">
            <SectionHeading icon={GraduationCap} color="text-indigo-500">
              {lang === "id" ? "Pendidikan & Akademik" : "Academic Background"}
            </SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoCard icon={Calendar} title={lang === "id" ? "Tahun Masuk" : "Start Year"} value={profile?.startYear} />
              <InfoCard icon={Award} title={lang === "id" ? "Tahun Lulus" : "Graduation Year"} value={profile?.graduationYear} />
              <InfoCard icon={GraduationCap} title={lang === "id" ? "Jenjang Tertinggi" : "Highest Education"} value={getEducationLabel(profile?.highestEducation)} />
              <InfoCard icon={Navigation} title={lang === "id" ? "Jenjang Masuk" : "Entry Level"} value={profile?.entryLevel?.name} />
              <InfoCard icon={CheckCircle2} title={lang === "id" ? "Status Terakhir" : "Graduation Status"} value={profile?.graduationStatus?.name} colorClass="text-purple-500 bg-purple-50" />
            </div>
          </section>

          {/* Location / Domicile */}
          <section>
            <SectionHeading icon={MapPin} color="text-rose-500">
              {lang === "id" ? "Lokasi & Domisili" : "Current Residence"}
            </SectionHeading>
            <div className="glass p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
               <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 rounded-2xl bg-rose-500 text-white">
                   <Globe size={24} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                     {profile?.domicileType === "DOMESTIC" ? (lang === "id" ? "Domisili Dalam Negeri" : "Domestic Resident") : (lang === "id" ? "Domisili Luar Negeri" : "Overseas Resident")}
                   </h3>
                   <p className="text-sm text-zinc-500">{lang === "id" ? "Alamat tempat tinggal terdaftar saat ini" : "Current verified primary residence"}</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {profile?.domicileType === "DOMESTIC" ? (
                    <>
                      <InfoCard icon={Building} title={lang === "id" ? "Wilayah Provinsi" : "Province"} value={profile?.provinceName} />
                      <InfoCard icon={MapPin} title={lang === "id" ? "Kota / Kabupaten" : "City / Regency"} value={profile?.cityName} />
                    </>
                  ) : (
                    <>
                      <InfoCard icon={Globe} title={lang === "id" ? "Negara" : "Country"} value={profile?.countryName} />
                      <InfoCard icon={MapPin} title={lang === "id" ? "State / Region" : "State / Region"} value={profile?.stateName} />
                    </>
                  )}
               </div>
            </div>
          </section>

          {/* Professional Status */}
          <section>
            <SectionHeading icon={Briefcase} color="text-amber-600">
              {lang === "id" ? "Status Profesional" : "Professional Career"}
            </SectionHeading>
            <div className="grid grid-cols-1 gap-6">
              <div className="relative overflow-hidden group p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border border-zinc-700 shadow-2xl shadow-zinc-900/30">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                  <Briefcase size={200} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="space-y-2">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">{lang === "id" ? "Status Kegiatan Utama" : "Primary Activity Status"}</span>
                     <h3 className="text-3xl font-outfit font-black tracking-tight">{profile?.activityStatus?.replace(/_/g, " ")}</h3>
                   </div>
                   
                   <div className="flex gap-4">
                     <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-blue-400" />
                        <span className="font-bold text-sm tracking-tight">{lang === "id" ? "Tervalidasi" : "Verified"}</span>
                     </div>
                   </div>
                </div>

                {/* Sub-details (College/Work) */}
                <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-300">
                  {(profile?.activityStatus?.includes("COLLEGE")) && (
                    <div className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3 text-white">
                        <GraduationCap size={20} className="text-indigo-400" />
                        <span className="font-bold">{lang === "id" ? "Akademik" : "Academic"}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-500">University</p>
                        <p className="text-sm font-bold text-zinc-100">{profile?.university?.name || profile?.otherUniversity || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Major</p>
                        <p className="text-sm font-bold text-zinc-100">{profile?.major?.name || profile?.otherMajor || "-"}</p>
                      </div>
                    </div>
                  )}

                  {(profile?.activityStatus?.includes("WORKING")) && (
                    <div className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/5 transition-all">
                      <div className="flex items-center gap-3 text-white">
                        <Building2 size={20} className="text-rose-400" />
                        <span className="font-bold">{lang === "id" ? "Karir" : "Career"}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Company</p>
                        <p className="text-sm font-bold text-zinc-100">{profile?.companyName || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-zinc-500">Position</p>
                        <p className="text-sm font-bold text-zinc-100">{profile?.jobPosition || "-"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
