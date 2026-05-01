"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createNotification } from "./notifications"

export async function getAlumniList(page: number = 1, pageSize: number = 10, search: string = "", gender: string = "ALL") {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || "ALUMNI";
    const currentUserId = session?.user?.id;

    const skip = (page - 1) * pageSize;
    
    const where: any = { role: "ALUMNI" };

    if (role === "ALUMNI" && currentUserId) {
      const currentProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } });
      if (currentProfile) {
        where.profile = {
          isMale: currentProfile.isMale
        };
      }
    } else if (gender !== "ALL") {
      where.profile = {
        isMale: gender === "MALE"
      };
    }

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
            maritalStatus: data.maritalStatusId ? { connect: { id: data.maritalStatusId } } : undefined,
            citizenship: data.citizenship || null,
            isMale: data.isMale !== undefined ? data.isMale : true,
            
            startYear: data.startYear ? parseInt(data.startYear) : null,
            graduationYear: data.graduationYear || null,
            highestEducation: data.highestEducation || null,
            entryLevel: data.entryLevelId ? { connect: { id: data.entryLevelId } } : undefined,
            graduationStatus: data.graduationStatusId ? { connect: { id: data.graduationStatusId } } : undefined,
            
            domicileType: data.domicileType || null,
            province: data.provinceId ? { connect: { id: data.provinceId } } : undefined,
            provinceName: data.provinceName || null,
            city: data.cityId ? { connect: { id: data.cityId } } : undefined,
            cityName: data.cityName || null,
            country: data.countryId ? { connect: { id: data.countryId } } : undefined,
            countryName: data.countryName || null,
            state: data.stateId ? { connect: { id: data.stateId } } : undefined,
            stateName: data.stateName || null,
            
            activityStatus: data.activityStatus || null,
            collegeDomicileType: data.collegeDomicileType || null,
            collegeLevel: data.collegeLevelId ? { connect: { id: data.collegeLevelId } } : undefined,
            university: data.universityId ? { connect: { id: data.universityId } } : undefined,
            otherUniversity: data.otherUniversity || null,
            major: data.majorId ? { connect: { id: data.majorId } } : undefined,
            otherMajor: data.otherMajor || null,
            collegeStatus: data.collegeStatusId ? { connect: { id: data.collegeStatusId } } : undefined,
            
            companyName: data.companyName || null,
            jobStatus: data.jobStatusId ? { connect: { id: data.jobStatusId } } : undefined,
            jobPosition: data.jobPosition || null,
            
            status: "APPROVED"
          } as any
        }
      } as any,
      include: { profile: true }
    })

    // Admin action, no revision or notification needed.

    revalidatePath("/admin/alumni")
    revalidatePath("/admin/approvals")
    return { success: true, data: newUser }
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: "Email ini sudah terdaftar." }
    if (e.code === 'P2025') return { success: false, error: "Data Master (Lokasi/Status) yang dipilih tidak ditemukan. Mohon refresh halaman dan coba lagi." }
    return { success: false, error: e.message || "Gagal membuat profil alumni." }
  }
}

export async function getAlumniDetails(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || "ALUMNI";
    const currentUserId = session?.user?.id;

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

    // ALUMNI role can only view details of their own gender, except if viewing their own profile
    if (role === "ALUMNI" && currentUserId && currentUserId !== userId) {
      const currentUserProfile = await prisma.alumniProfile.findUnique({ where: { userId: currentUserId } });
      if (currentUserProfile && user.profile && currentUserProfile.isMale !== user.profile.isMale) {
        return { success: false, error: "Tidak memiliki akses untuk melihat profil ini." };
      }
    }

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
          maritalStatus: data.maritalStatusId ? { connect: { id: data.maritalStatusId } } : { disconnect: true },
          citizenship: data.citizenship || null,
          isMale: data.isMale !== undefined ? data.isMale : true,
          startYear: data.startYear ? parseInt(data.startYear) : null,
          graduationYear: data.graduationYear || null,
          highestEducation: data.highestEducation || null,
          entryLevel: data.entryLevelId ? { connect: { id: data.entryLevelId } } : { disconnect: true },
          graduationStatus: data.graduationStatusId ? { connect: { id: data.graduationStatusId } } : { disconnect: true },
          domicileType: data.domicileType || null,
          province: data.provinceId ? { connect: { id: data.provinceId } } : undefined,
          provinceName: data.provinceName || null,
          city: data.cityId ? { connect: { id: data.cityId } } : undefined,
          cityName: data.cityName || null,
          country: data.countryId ? { connect: { id: data.countryId } } : undefined,
          countryName: data.countryName || null,
          state: data.stateId ? { connect: { id: data.stateId } } : undefined,
          stateName: data.stateName || null,
          activityStatus: data.activityStatus || null,
          collegeDomicileType: data.collegeDomicileType || null,
          collegeLevel: data.collegeLevelId ? { connect: { id: data.collegeLevelId } } : { disconnect: true },
          university: data.universityId ? { connect: { id: data.universityId } } : { disconnect: true },
          otherUniversity: data.otherUniversity || null,
          major: data.majorId ? { connect: { id: data.majorId } } : { disconnect: true },
          otherMajor: data.otherMajor || null,
          collegeStatus: data.collegeStatusId ? { connect: { id: data.collegeStatusId } } : { disconnect: true },
          companyName: data.companyName || null,
          jobStatus: data.jobStatusId ? { connect: { id: data.jobStatusId } } : { disconnect: true },
          jobPosition: data.jobPosition || null,
          status: "APPROVED" // Reset to approved on direct update
        } as any
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
          profile: { connect: { id: currentProfileId! } },
          user: { connect: { id: userId } },
          status: "WAITING",
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          maritalStatus: data.maritalStatusId ? { connect: { id: data.maritalStatusId } } : undefined,
          citizenship: data.citizenship || null,
          isMale: data.isMale !== undefined ? data.isMale : true,
          startYear: data.startYear ? parseInt(data.startYear) : null,
          graduationYear: data.graduationYear || null,
          highestEducation: data.highestEducation || null,
          entryLevel: data.entryLevelId ? { connect: { id: data.entryLevelId } } : undefined,
          graduationStatus: data.graduationStatusId ? { connect: { id: data.graduationStatusId } } : undefined,
          domicileType: data.domicileType || null,
          province: data.provinceId ? { connect: { id: data.provinceId } } : undefined,
          provinceName: data.provinceName || null,
          city: data.cityId ? { connect: { id: data.cityId } } : undefined,
          cityName: data.cityName || null,
          country: data.countryId ? { connect: { id: data.countryId } } : undefined,
          countryName: data.countryName || null,
          state: data.stateId ? { connect: { id: data.stateId } } : undefined,
          stateName: data.stateName || null,
          activityStatus: data.activityStatus || null,
          collegeDomicileType: data.collegeDomicileType || null,
          collegeLevel: data.collegeLevelId ? { connect: { id: data.collegeLevelId } } : undefined,
          university: data.universityId ? { connect: { id: data.universityId } } : undefined,
          otherUniversity: data.otherUniversity || null,
          major: data.majorId ? { connect: { id: data.majorId } } : undefined,
          otherMajor: data.otherMajor || null,
          collegeStatus: data.collegeStatusId ? { connect: { id: data.collegeStatusId } } : undefined,
          companyName: data.companyName || null,
          jobStatus: data.jobStatusId ? { connect: { id: data.jobStatusId } } : undefined,
          jobPosition: data.jobPosition || null,
        } as any
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
    if (error.code === 'P2025') return { success: false, error: "Gagal memperbarui: Data Master (Lokasi/Status) tidak ditemukan. Pastikan data seeder sudah selesai." }
    return { success: false, error: error.message || "Gagal memperbarui profil alumni." }
  }
}

