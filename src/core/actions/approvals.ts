"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createNotification } from "./notifications"

export async function getPendingRevisions() {
  try {
    const revisions = await prisma.profileRevision.findMany({
      where: { status: "WAITING" },
      include: {
        user: true,
        profile: true
      },
      orderBy: { createdAt: "asc" }
    })
    return { success: true, data: revisions }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getRevisionDetails(id: string) {
  try {
    const revision = await prisma.profileRevision.findUnique({
      where: { id },
      include: {
        user: true,
        profile: {
          include: {
             maritalStatus: true, entryLevel: true, graduationStatus: true,
             collegeLevel: true, university: true, major: true, collegeStatus: true, jobStatus: true
          }
        },
        maritalStatus: true, entryLevel: true, graduationStatus: true,
        collegeLevel: true, university: true, major: true, collegeStatus: true, jobStatus: true
      }
    })
    return { success: true, data: revision }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function approveRevision(id: string) {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role
  if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  // Strict Matrix Check (Bypass for SUPERUSER)
  if (userRole !== "SUPERUSER") {
    const isApprover = await prisma.masterData.findFirst({
      where: { category: "APPROVER_EMAIL", name: session.user.email?.toLowerCase(), isActive: true }
    });
    if (!isApprover) {
      return { success: false, error: "Anda tidak terdaftar dalam Approval Matrix. Fitur persetujuan dikunci." }
    }
  }

  try {
    const revision = await prisma.profileRevision.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!revision) return { success: false, error: "Revisi tidak ditemukan." }

    // Backup current profile as "Log" can be done by creating an AuditLog
    await prisma.auditLog.create({
      data: {
        action: "APPROVE_REVISION",
        entityType: "ProfileRevision",
        entityId: revision.id,
        userId: session.user.id,
        changes: JSON.stringify(revision) // Store what was approved
      }
    })

    // Apply changes to AlumniProfile
    await prisma.alumniProfile.update({
      where: { id: revision.profileId },
      data: {
        status: "APPROVED",
        rejectionNotes: null,
        fullName: revision.fullName || revision.profile.fullName,
        phoneNumber: revision.phoneNumber,
        maritalStatus: revision.maritalStatusId ? { connect: { id: revision.maritalStatusId } } : { disconnect: true },
        citizenship: revision.citizenship,
        isMale: revision.isMale !== null ? revision.isMale : revision.profile.isMale,
        
        startYear: revision.startYear,
        graduationYear: revision.graduationYear,
        highestEducation: revision.highestEducation,
        entryLevel: revision.entryLevelId ? { connect: { id: revision.entryLevelId } } : { disconnect: true },
        graduationStatus: revision.graduationStatusId ? { connect: { id: revision.graduationStatusId } } : { disconnect: true },
        
        domicileType: revision.domicileType,
        provinceId: revision.provinceId,
        provinceName: revision.provinceName,
        cityId: revision.cityId,
        cityName: revision.cityName,
        countryId: revision.countryId,
        countryName: revision.countryName,
        stateId: revision.stateId,
        stateName: revision.stateName,
        
        activityStatus: revision.activityStatus,
        collegeDomicileType: revision.collegeDomicileType,
        collegeLevel: revision.collegeLevelId ? { connect: { id: revision.collegeLevelId } } : { disconnect: true },
        university: revision.universityId ? { connect: { id: revision.universityId } } : { disconnect: true },
        otherUniversity: revision.otherUniversity,
        major: revision.majorId ? { connect: { id: revision.majorId } } : { disconnect: true },
        otherMajor: revision.otherMajor,
        collegeStatus: revision.collegeStatusId ? { connect: { id: revision.collegeStatusId } } : { disconnect: true },
        
        companyName: revision.companyName,
        jobStatus: revision.jobStatusId ? { connect: { id: revision.jobStatusId } } : { disconnect: true },
        jobPosition: revision.jobPosition,
      } as any
    })

    // Mark revision as APPROVED
    await prisma.profileRevision.update({
      where: { id },
      data: { status: "APPROVED" }
    })

    if (revision.fullName) {
      await prisma.user.update({
        where: { id: revision.userId },
        data: { name: revision.fullName }
      })
    }

    // Send Notification to Alumni
    await createNotification({
      userId: revision.userId,
      title: "Profil Disetujui",
      message: "Perubahan profil Anda telah disetujui oleh admin.",
      type: "SUCCESS",
      link: `/admin/alumni/${revision.userId}`
    })

    revalidatePath("/admin/approvals")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function rejectRevision(id: string, notes: string) {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role
  if (!session?.user?.id || (userRole !== "ADMIN" && userRole !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  // Strict Matrix Check (Bypass for SUPERUSER)
  if (userRole !== "SUPERUSER") {
    const isApprover = await prisma.masterData.findFirst({
      where: { category: "APPROVER_EMAIL", name: session.user.email?.toLowerCase(), isActive: true }
    });
    if (!isApprover) {
      return { success: false, error: "Anda tidak terdaftar dalam Approval Matrix. Fitur penolakan dikunci." }
    }
  }

  try {
    const revision = await prisma.profileRevision.update({
      where: { id },
      data: { 
        status: "REJECTED",
        adminNotes: notes
      }
    })

    // Revert profile back to APPROVED or DRAFT since the change was rejected
    // Wait, let's just mark it APPROVED so the user can make a new edit. 
    // If it was their first edit, they had nothing, but it's safe to revert status.
    await prisma.alumniProfile.update({
      where: { id: revision.profileId },
      data: { 
        status: "REJECTED",
        rejectionNotes: notes
      } 
    })

    await prisma.auditLog.create({
      data: {
        action: "REJECT_REVISION",
        entityType: "ProfileRevision",
        entityId: id,
        userId: session.user.id,
        changes: JSON.stringify({ reason: notes })
      }
    })

    // Send Notification to Alumni
    await createNotification({
      userId: revision.userId,
      title: "Profil Ditolak",
      message: `Perubahan profil Anda ditolak. Alasan: ${notes}`,
      type: "DANGER",
      link: `/admin/alumni/${revision.userId}/edit`
    })

    revalidatePath("/admin/approvals")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
