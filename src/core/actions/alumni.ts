"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createNotification } from "./notifications"

export async function getAlumniList(page: number = 1, pageSize: number = 10, search: string = "") {
  try {
    const skip = (page - 1) * pageSize;
    
    const where: any = { role: "ALUMNI" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    return { 
      success: true, 
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addAlumni(data: { email: string; name: string }) {
  if (!data.email) return { success: false, error: "Email required" }

  try {
    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: "ALUMNI",
        profile: {
          create: {
            fullName: data.name,
            status: "DRAFT"
          }
        }
      }
    })
    revalidatePath("/admin/alumni")
    return { success: true, data: newUser }
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { success: false, error: "Email ini sudah terdaftar di sistem." }
    }
    return { success: false, error: e.message || "Failed to create alumni." }
  }
}

export async function deleteAlumni(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin/alumni")
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete alumni." }
  }
}

export async function createFullAlumni(data: any) {
  if (!data.email || !data.fullName) return { success: false, error: "Email dan Nama Lengkap wajib diisi." }

  try {
    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.fullName,
        role: "ALUMNI",
        profile: {
          create: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber || null,
            maritalStatusId: data.maritalStatusId || null,
            citizenship: data.citizenship || null,
            
            startYear: data.startYear ? parseInt(data.startYear) : null,
            graduationYear: data.graduationYear || null,
            highestEducation: data.highestEducation || null,
            entryLevelId: data.entryLevelId || null,
            graduationStatusId: data.graduationStatusId || null,
            
            domicileType: data.domicileType || null,
            provinceId: data.provinceId || null,
            provinceName: data.provinceName || null,
            cityId: data.cityId || null,
            cityName: data.cityName || null,
            countryId: data.countryId || null,
            countryName: data.countryName || null,
            stateId: data.stateId || null,
            stateName: data.stateName || null,
            
            activityStatus: data.activityStatus || null,
            collegeDomicileType: data.collegeDomicileType || null,
            collegeLevelId: data.collegeLevelId || null,
            universityId: data.universityId || null,
            otherUniversity: data.otherUniversity || null,
            majorId: data.majorId || null,
            otherMajor: data.otherMajor || null,
            collegeStatusId: data.collegeStatusId || null,
            
            companyName: data.companyName || null,
            jobStatusId: data.jobStatusId || null,
            jobPosition: data.jobPosition || null,
            
            status: "WAITING" // Changes require approval
          }
        }
      },
      include: { profile: true }
    })

    if (newUser.profile) {
      await prisma.profileRevision.create({
        data: {
          profileId: newUser.profile.id,
          userId: newUser.id,
          status: "WAITING",

          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          maritalStatusId: data.maritalStatusId || null,
          citizenship: data.citizenship || null,
          
          startYear: data.startYear ? parseInt(data.startYear) : null,
          graduationYear: data.graduationYear || null,
          highestEducation: data.highestEducation || null,
          entryLevelId: data.entryLevelId || null,
          graduationStatusId: data.graduationStatusId || null,
          
          domicileType: data.domicileType || null,
          provinceId: data.provinceId || null,
          provinceName: data.provinceName || null,
          cityId: data.cityId || null,
          cityName: data.cityName || null,
          countryId: data.countryId || null,
          countryName: data.countryName || null,
          stateId: data.stateId || null,
          stateName: data.stateName || null,
          
          activityStatus: data.activityStatus || null,
          collegeDomicileType: data.collegeDomicileType || null,
          collegeLevelId: data.collegeLevelId || null,
          universityId: data.universityId || null,
          otherUniversity: data.otherUniversity || null,
          majorId: data.majorId || null,
          otherMajor: data.otherMajor || null,
          collegeStatusId: data.collegeStatusId || null,
          
          companyName: data.companyName || null,
          jobStatusId: data.jobStatusId || null,
          jobPosition: data.jobPosition || null,
        }
      })

      // Notify Admins
      await createNotification({
        userId: null, // null for all admins
        title: "Pengajuan Alumni Baru",
        message: `${data.fullName} baru saja mengisi data alumni dan menunggu persetujuan.`,
        type: "APPROVAL_REQUEST",
        link: "/admin/approvals"
      })
    }

    revalidatePath("/admin/alumni")
    revalidatePath("/admin/approvals")
    return { success: true, data: newUser }
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Email ini sudah terdaftar." }
    return { success: false, error: e.message || "Gagal membuat profil alumni." }
  }
}

export async function getAlumniDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        profile: {
          include: {
            maritalStatus: true,
            entryLevel: true,
            graduationStatus: true,
            collegeLevel: true,
            university: true,
            major: true,
            collegeStatus: true,
            jobStatus: true
          }
        } 
      }
    })
    if (!user) return { success: false, error: "Alumni tidak ditemukan" }
    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateFullAlumni(userId: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  
  const userRole = session.user.role
  const isAdmin = userRole === "SUPERUSER" || userRole === "ADMIN"

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) return { success: false, error: "Alumni tidak ditemukan" };

    // Update user base data
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email ? data.email.toLowerCase() : user.email,
        name: data.fullName || user.name,
      }
    });

    const isExistingProfile = !!user.profile;
    let currentProfileId = user.profile?.id;

    if (!isExistingProfile) {
      const newProfile = await prisma.alumniProfile.create({
        data: {
          userId,
          fullName: data.fullName,
          status: isAdmin ? "APPROVED" : "WAITING"
        }
      });
      currentProfileId = newProfile.id;
    }

    if (isAdmin) {
      // Direct update for Admin/SuperUser
      await prisma.alumniProfile.update({
        where: { userId },
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          maritalStatusId: data.maritalStatusId || null,
          citizenship: data.citizenship || null,
          startYear: data.startYear ? parseInt(data.startYear) : null,
          graduationYear: data.graduationYear || null,
          highestEducation: data.highestEducation || null,
          entryLevelId: data.entryLevelId || null,
          graduationStatusId: data.graduationStatusId || null,
          domicileType: data.domicileType || null,
          provinceId: data.provinceId || null,
          provinceName: data.provinceName || null,
          cityId: data.cityId || null,
          cityName: data.cityName || null,
          countryId: data.countryId || null,
          countryName: data.countryName || null,
          stateId: data.stateId || null,
          stateName: data.stateName || null,
          activityStatus: data.activityStatus || null,
          collegeDomicileType: data.collegeDomicileType || null,
          collegeLevelId: data.collegeLevelId || null,
          universityId: data.universityId || null,
          otherUniversity: data.otherUniversity || null,
          majorId: data.majorId || null,
          otherMajor: data.otherMajor || null,
          collegeStatusId: data.collegeStatusId || null,
          companyName: data.companyName || null,
          jobStatusId: data.jobStatusId || null,
          jobPosition: data.jobPosition || null,
          status: "APPROVED" // Reset to approved on direct update
        }
      });
      
      await prisma.auditLog.create({
        data: {
          action: "DIRECT_UPDATE_PROFILE",
          entityType: "Profile",
          entityId: currentProfileId!,
          userId: session.user.id,
          changes: data
        }
      });
    } else {
      // Create revision for Alumni
      await prisma.alumniProfile.update({
        where: { userId },
        data: { status: "WAITING" }
      });

      await prisma.profileRevision.create({
        data: {
          profileId: currentProfileId!,
          userId: userId,
          status: "WAITING",
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          maritalStatusId: data.maritalStatusId || null,
          citizenship: data.citizenship || null,
          startYear: data.startYear ? parseInt(data.startYear) : null,
          graduationYear: data.graduationYear || null,
          highestEducation: data.highestEducation || null,
          entryLevelId: data.entryLevelId || null,
          graduationStatusId: data.graduationStatusId || null,
          domicileType: data.domicileType || null,
          provinceId: data.provinceId || null,
          provinceName: data.provinceName || null,
          cityId: data.cityId || null,
          cityName: data.cityName || null,
          countryId: data.countryId || null,
          countryName: data.countryName || null,
          stateId: data.stateId || null,
          stateName: data.stateName || null,
          activityStatus: data.activityStatus || null,
          collegeDomicileType: data.collegeDomicileType || null,
          collegeLevelId: data.collegeLevelId || null,
          universityId: data.universityId || null,
          otherUniversity: data.otherUniversity || null,
          majorId: data.majorId || null,
          otherMajor: data.otherMajor || null,
          collegeStatusId: data.collegeStatusId || null,
          companyName: data.companyName || null,
          jobStatusId: data.jobStatusId || null,
          jobPosition: data.jobPosition || null,
        }
      });

      // Notify Admins
      await createNotification({
        userId: null, // null for all admins
        title: "Update Profil Alumni",
        message: `Terdapat pembaruan profil dari alumni dan menunggu persetujuan.`,
        type: "APPROVAL_REQUEST",
        link: "/admin/approvals"
      })
    }

    revalidatePath("/admin/alumni")
    revalidatePath("/admin/approvals")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui profil alumni." }
  }
}

