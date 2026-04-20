"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getMyProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const profile = await prisma.alumniProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        maritalStatus: true,
        entryLevel: true,
        graduationStatus: true,
        collegeLevel: true,
        university: true,
        major: true,
        collegeStatus: true,
        jobStatus: true,
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    if (!profile) return { success: false, error: "Profil tidak ditemukan." }

    return { success: true, data: profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function submitProfileRevision(formData: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const profile = await prisma.alumniProfile.findUnique({
      where: { userId: session.user.id },
      include: { revisions: { where: { status: "WAITING" } } }
    })

    if (!profile) return { success: false, error: "Profil tidak ditemukan." }
    
    if (profile.revisions && profile.revisions.length > 0) {
      return { success: false, error: "Terdapat permintaan pengubahan data yang masih menunggu persetujuan Admin." }
    }

    const newRevision = await prisma.profileRevision.create({
      data: {
        profileId: profile.id,
        userId: session.user.id,
        status: "WAITING",

        fullName: formData.fullName || null,
        phoneNumber: formData.phoneNumber || null,
        maritalStatusId: formData.maritalStatusId || null,
        citizenship: formData.citizenship || null,
        
        startYear: formData.startYear ? parseInt(formData.startYear) : null,
        graduationYear: formData.graduationYear || null,
        highestEducation: formData.highestEducation || null,
        entryLevelId: formData.entryLevelId || null,
        graduationStatusId: formData.graduationStatusId || null,
        
        domicileType: formData.domicileType || null,
        provinceId: formData.provinceId || null,
        provinceName: formData.provinceName || null,
        cityId: formData.cityId || null,
        cityName: formData.cityName || null,
        countryId: formData.countryId || null,
        countryName: formData.countryName || null,
        stateId: formData.stateId || null,
        stateName: formData.stateName || null,
        
        activityStatus: formData.activityStatus || null,
        collegeDomicileType: formData.collegeDomicileType || null,
        collegeLevelId: formData.collegeLevelId || null,
        universityId: formData.universityId || null,
        otherUniversity: formData.otherUniversity || null,
        majorId: formData.majorId || null,
        otherMajor: formData.otherMajor || null,
        collegeStatusId: formData.collegeStatusId || null,
        
        companyName: formData.companyName || null,
        jobStatusId: formData.jobStatusId || null,
        jobPosition: formData.jobPosition || null,
      }
    })

    // Update base status to WAITING
    await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: { status: "WAITING" }
    })

    revalidatePath("/dashboard")
    return { success: true, data: newRevision }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengajukan revisi" }
  }
}
