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
        profile: { connect: { id: profile.id } },
        user: { connect: { id: session.user.id } },
        status: "WAITING",

        fullName: formData.fullName || null,
        phoneNumber: formData.phoneNumber || null,
        maritalStatus: formData.maritalStatusId ? { connect: { id: formData.maritalStatusId } } : undefined,
        citizenship: formData.citizenship || null,
        isMale: formData.isMale !== undefined ? formData.isMale : true,
        
        startYear: formData.startYear ? parseInt(formData.startYear) : null,
        graduationYear: formData.graduationYear || null,
        highestEducation: formData.highestEducation || null,
        entryLevel: formData.entryLevelId ? { connect: { id: formData.entryLevelId } } : undefined,
        graduationStatus: formData.graduationStatusId ? { connect: { id: formData.graduationStatusId } } : undefined,
        
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
        collegeLevel: formData.collegeLevelId ? { connect: { id: formData.collegeLevelId } } : undefined,
        university: formData.universityId ? { connect: { id: formData.universityId } } : undefined,
        otherUniversity: formData.otherUniversity || null,
        major: formData.majorId ? { connect: { id: formData.majorId } } : undefined,
        otherMajor: formData.otherMajor || null,
        collegeStatus: formData.collegeStatusId ? { connect: { id: formData.collegeStatusId } } : undefined,
        
        companyName: formData.companyName || null,
        jobStatus: formData.jobStatusId ? { connect: { id: formData.jobStatusId } } : undefined,
        jobPosition: formData.jobPosition || null,
      } as any
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
