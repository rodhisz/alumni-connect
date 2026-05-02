import { getMyProfile } from "@/core/actions/portal"
import { getMasterData } from "@/core/actions/master-data"
import { redirect } from "next/navigation"
import EditAlumniForm from "./EditAlumniForm"

export const dynamic = "force-dynamic"

export default async function EditProfilePage() {
  const { data: profile, error } = await getMyProfile()

  if (error || !profile) {
    redirect("/dashboard")
  }

  // Double verification, if status is waiting, redirect back
  if (profile.status === "WAITING") {
    redirect("/dashboard")
  }

  const { data: masterData } = await getMasterData()
  
  // Group options by Category
  const options: Record<string, { value: string; label: string }[]> = {}
  
  if (masterData) {
    masterData.filter((d: any) => d.isActive).forEach((d: any) => {
      if (!options[d.category]) options[d.category] = []
      options[d.category].push({ value: d.id, label: d.name })
    })
  }

  // Format existing profile to be consumed by the Form State
  const initialData = {
    fullName: profile.fullName || "",
    phoneNumber: profile.phoneNumber || "",
    maritalStatusId: profile.maritalStatusId || "",
    citizenship: profile.citizenship || "",
    isMale: profile.isMale !== undefined ? profile.isMale : true,
    startYear: profile.startYear?.toString() || "",
    graduationYear: profile.graduationYear || "",
    highestEducation: profile.highestEducation || "",
    entryLevelId: profile.entryLevelId || "",
    graduationStatusId: profile.graduationStatusId || "",
    domicileType: profile.domicileType || "DOMESTIC",
    provinceId: profile.provinceId || "",
    cityId: profile.cityId || "",
    countryId: profile.countryId || "",
    stateId: profile.stateId || "",
    activityStatus: profile.activityStatus || "",
    universityId: profile.universityId || "",
    otherUniversity: profile.otherUniversity || "",
    majorId: profile.majorId || "",
    otherMajor: profile.otherMajor || "",
    collegeStatusId: profile.collegeStatusId || "",
    companyName: profile.companyName || "",
    jobPosition: profile.jobPosition || "",
    jobStatusId: profile.jobStatusId || ""
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 sm:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-outfit font-bold text-zinc-900 dark:text-white">
          Ubah Data Profil
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
          Perubahan yang Anda ajukan akan masuk ke dalam daftar antrean untuk diverifikasi oleh Administrator sebelum dipublikasikan.
        </p>
      </div>

      <EditAlumniForm options={options} initialData={initialData} />
    </div>
  )
}
