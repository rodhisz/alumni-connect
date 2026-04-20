import { getAlumniDetails } from "@/core/actions/alumni"
import { getMasterData } from "@/core/actions/master-data"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import AdminEditAlumniForm from "./AdminEditAlumniForm"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminEditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: user, error } = await getAlumniDetails(id)

  if (error || !user) {
    redirect("/admin/alumni")
  }

  const { data: masterData } = await getMasterData()
  
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || "ALUMNI"
  const isAdmin = userRole === "SUPERUSER" || userRole === "ADMIN"

  // Authorization: Alumni can only edit their own id
  if (!isAdmin && session?.user?.id !== id) {
    redirect("/admin")
  }

  // Check for pending revisions
  const pendingRevision = await prisma.profileRevision.findFirst({
    where: { 
      userId: id,
      status: "WAITING"
    }
  })
  
  const hasPendingRevision = !!pendingRevision
  
  // Group options by Category
  const options: Record<string, { value: string; label: string }[]> = {}
  
  if (masterData) {
    masterData.filter(d => d.isActive).forEach(d => {
      if (!options[d.category]) options[d.category] = []
      options[d.category].push({ value: d.id, label: d.name })
    })
  }

  // Format existing profile to be consumed by the Form State
  const initialData = {
    email: user.email,
    fullName: user.profile?.fullName || user.name || "",
    phoneNumber: user.profile?.phoneNumber || "",
    maritalStatusId: user.profile?.maritalStatusId || "",
    citizenship: user.profile?.citizenship || "",
    startYear: user.profile?.startYear?.toString() || "",
    graduationYear: user.profile?.graduationYear || "",
    highestEducation: user.profile?.highestEducation || "",
    entryLevelId: user.profile?.entryLevelId || "",
    graduationStatusId: user.profile?.graduationStatusId || "",
    domicileType: user.profile?.domicileType || "DOMESTIC",
    provinceId: user.profile?.provinceId || "",
    cityId: user.profile?.cityId || "",
    countryId: user.profile?.countryId || "",
    stateId: user.profile?.stateId || "",
    activityStatus: user.profile?.activityStatus || "",
    collegeLevelId: user.profile?.collegeLevelId || "",
    universityId: user.profile?.universityId || "",
    otherUniversity: user.profile?.otherUniversity || "",
    majorId: user.profile?.majorId || "",
    otherMajor: user.profile?.otherMajor || "",
    collegeStatusId: user.profile?.collegeStatusId || "",
    companyName: user.profile?.companyName || "",
    jobPosition: user.profile?.jobPosition || "",
    jobStatusId: user.profile?.jobStatusId || ""
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 sm:pb-8 w-full">
      <div className="mb-8 space-y-4">
        <Link 
          href="/admin/profile" 
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors group"
        >
          <div className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
            <ChevronLeft size={16} />
          </div>
          Kembali ke Profil
        </Link>
        <div>
          <h1 className="text-3xl font-outfit font-bold text-zinc-900 dark:text-white">
            {isAdmin ? "Manajemen Profil Alumni (Admin)" : "Profil Saya"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            {isAdmin 
              ? "Sebagai Admin/SuperUser, Anda berhak mengubah secara langsung tanpa melewati prosedur Approval terlebih dahulu." 
              : "Lengkapi data diri Anda. Perubahan data mungkin memerlukan verifikasi oleh petugas sebelum disahkan."}
          </p>
        </div>
      </div>

      <AdminEditAlumniForm 
        options={options} 
        initialData={initialData} 
        userId={user.id} 
        isAdmin={isAdmin}
        hasPendingRevision={hasPendingRevision}
      />
    </div>
  )
}
