"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Category } from "@prisma/client"
import { CATEGORY_LABELS } from "@/lib/constants"

/**
 * Bulk import Master Data
 */
export async function importMasterDataBulk(items: any[], dryRun: boolean = false) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    if (dryRun) {
      const validations = await Promise.all(items.map(async (item) => {
        const categoryInput = (item.Category || item.category || "").trim();
        const name = item.Name || item.name;
        
        const techName = (Object.keys(CATEGORY_LABELS) as Category[]).find(
          key => CATEGORY_LABELS[key] === categoryInput || key === categoryInput
        );

        if (!techName) return { name, error: `Kategori tidak valid: ${categoryInput}`, type: 'ERROR' };

        const existing = await prisma.masterData.findUnique({
          where: { category_name: { category: techName, name } }
        });

        if (existing) return { name, message: "Sudah terdaftar (akan di-update)", type: 'WARNING' };
        return { name, message: "Siap diimpor (data baru)", type: 'SUCCESS' };
      }));
      return { success: true, dryRun: true, results: validations };
    }

    const results = await prisma.$transaction(
      items.map((item) => {
        const categoryInput = (item.Category || item.category || "").trim();
        const name = item.Name || item.name;
        const description = item.Description || item.description || null;
        const order = parseInt(item.Order || item.order || "0");

        // Try to find technical name from label
        const techName = (Object.keys(CATEGORY_LABELS) as Category[]).find(
          key => CATEGORY_LABELS[key] === categoryInput || key === categoryInput
        );

        if (!techName) {
          throw new Error(`Kategori tidak valid: ${categoryInput}`);
        }

        return prisma.masterData.upsert({
          where: { 
            category_name: { 
              category: techName, 
              name: name 
            } 
          },
          update: { description, order },
          create: { 
            category: techName as Category, 
            name: name, 
            description, 
            order 
          }
        });
      })
    );

    revalidatePath("/admin/master")
    return { success: true, count: results.length }
  } catch (error: any) {
    console.error("Master Data Import Error:", error)
    return { success: false, error: error.message || "Gagal mengimpor Master Data. Pastikan kategori valid." }
  }
}

/**
 * Bulk import Alumni (User + Profile)
 */
export async function importAlumniBulk(items: any[], dryRun: boolean = false) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    if (dryRun) {
      const validations = await Promise.all(items.map(async (item) => {
        const email = (item.Email || item.email || "").toLowerCase().trim();
        const name = item["Full Name"] || item["Nama Lengkap"] || item.name || item.fullName;

        if (!email) return { name: name || "Unknown", error: "Email kosong", type: 'ERROR' };
        if (!name) return { name: email, error: "Nama kosong", type: 'ERROR' };

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return { name, error: "Email sudah terdaftar", type: 'ERROR' };

        return { name, message: "Siap diimpor", type: 'SUCCESS' };
      }));
      return { success: true, dryRun: true, results: validations };
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      const email = (item.Email || item.email || "").toLowerCase().trim();
      const name = item["Full Name"] || item["Nama Lengkap"] || item.name || item.fullName;

      if (!email || !name) {
        skippedCount++;
        continue;
      }

      // Check if user exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        skippedCount++;
        continue;
      }

      // Create User with ALUMNI role
      // Note: passwordHash is null, user must use Reset Password (Inject) to set it
      await prisma.user.create({
        data: {
          email,
          name,
          role: "ALUMNI",
          profile: {
            create: {
              fullName: name,
              status: "DRAFT"
            }
          }
        }
      });
      createdCount++;
    }

    revalidatePath("/admin/alumni")
    return { success: true, created: createdCount, skipped: skippedCount }
  } catch (error: any) {
    console.error("Alumni Import Error:", error)
    return { success: false, error: error.message || "Gagal mengimpor data alumni." }
  }
}

/**
 * Bulk import Alumni with Full Data (Legacy Data)
 */
export async function importAlumniFullBulk(items: any[], dryRun: boolean = false) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERUSER")) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    if (dryRun) {
      const validations = await Promise.all(items.map(async (item) => {
        const email = (item.Email || item.email || "").toLowerCase().trim();
        const name = item["Full Name"] || item["Nama Lengkap"] || item.name || item.fullName;

        if (!email) return { name: name || "Unknown", error: "Email kosong", type: 'ERROR' };
        if (!name) return { name: email, error: "Nama kosong", type: 'ERROR' };

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return { name, message: "Akan di-update", type: 'WARNING' };

        return { name, message: "Siap diimpor", type: 'SUCCESS' };
      }));
      return { success: true, dryRun: true, results: validations };
    }

    let count = 0;
    for (const item of items) {
      const email = (item.Email || item.email || "").toLowerCase().trim();
      const name = item["Full Name"] || item["Nama Lengkap"] || item.name || item.fullName;
      if (!email || !name) continue;

      const phone = item["Phone Number"] || item["No HP"] || item.phoneNumber;
      const startYear = parseInt(item["Start Year"] || item["Tahun Masuk"] || "0");
      const gradYear = (item["Graduation Year"] || item["Tahun Lulus"] || "").toString();
      const education = item["Highest Education"] || item["Jenjang Terakhir"];
      
      const domicileType = (item.Domisili || item.domicileType) === "FOREIGN" ? "FOREIGN" : "DOMESTIC";
      const provinceName = item["Provinsi/Negara"] || item.provinceName;
      const cityName = item["Kota/State"] || item.cityName;
      const companyName = item.Pekerjaan || item.companyName;
      const jobPosition = item.Posisi || item.jobPosition;

      await prisma.user.upsert({
        where: { email },
        update: {
          name,
          profile: {
            upsert: {
              create: {
                fullName: name,
                phoneNumber: phone,
                startYear: startYear || null,
                graduationYear: gradYear || null,
                highestEducation: education || null,
                domicileType,
                provinceName: domicileType === "DOMESTIC" ? provinceName : null,
                cityName: domicileType === "DOMESTIC" ? cityName : null,
                countryName: domicileType === "FOREIGN" ? provinceName : null,
                stateName: domicileType === "FOREIGN" ? cityName : null,
                companyName,
                jobPosition,
                status: "APPROVED"
              },
              update: {
                fullName: name,
                phoneNumber: phone,
                startYear: startYear || null,
                graduationYear: gradYear || null,
                highestEducation: education || null,
                domicileType,
                provinceName: domicileType === "DOMESTIC" ? provinceName : null,
                cityName: domicileType === "DOMESTIC" ? cityName : null,
                countryName: domicileType === "FOREIGN" ? provinceName : null,
                stateName: domicileType === "FOREIGN" ? cityName : null,
                companyName,
                jobPosition,
                status: "APPROVED"
              }
            }
          }
        },
        create: {
          email,
          name,
          role: "ALUMNI",
          profile: {
            create: {
              fullName: name,
              phoneNumber: phone,
              startYear: startYear || null,
              graduationYear: gradYear || null,
              highestEducation: education || null,
              domicileType,
              provinceName: domicileType === "DOMESTIC" ? provinceName : null,
              cityName: domicileType === "DOMESTIC" ? cityName : null,
              countryName: domicileType === "FOREIGN" ? provinceName : null,
              stateName: domicileType === "FOREIGN" ? cityName : null,
              companyName,
              jobPosition,
              status: "APPROVED"
            }
          }
        }
      });
      count++;
    }

    revalidatePath("/admin/alumni")
    return { success: true, count }
  } catch (error: any) {
    console.error("Full Alumni Import Error:", error)
    return { success: false, error: error.message || "Gagal mengimpor data alumni lengkap." }
  }
}
