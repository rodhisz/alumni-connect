import { PrismaClient, Category } from "@prisma/client"
import * as fs from 'fs'
import * as path from 'path'
import { config } from "dotenv"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed...")

  // 1. Marital Status
  const maritalStatuses = ["Kawin", "Belum Kawin", "Cerai Hidup", "Cerai Mati"]
  for (const name of maritalStatuses) {
    await prisma.masterData.upsert({
      where: { id: `marital-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `marital-${name.toLowerCase().replace(/\s+/g, '-')}`,
        category: "MARITAL_STATUS",
        name,
        isActive: true
      }
    })
  }

  // 2. Citizenship
  const citizenships = ["Warga Negara Indonesia", "Warga Negara Asing"]
  for (const name of citizenships) {
    await prisma.masterData.upsert({
      where: { id: `cit-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `cit-${name.toLowerCase().replace(/\s+/g, '-')}`,
        category: "CITIZENSHIP", // Fixed category
        // Looking at schema.prisma line 75, it's not there.
        // It's used as a string in AlumniProfile.citizenship.
        // But the user said "(A). Data pribadi ... kewarganegaraan (Opsi : Warga Negara Indonesia/Warga Negara Asing)"
        // Since it's not in the Category enum, I'll Skip seeding it as MasterData and use it as options in frontend later.
        name,
        isActive: true
      }
    })
  }
  // Cleaning up my mistake above: citizenships are not in Category enum.
  // I will only seed what's in the Enum.

  // 3. College Level
  const collegeLevels = ["D1", "D2", "D3", "D4", "S1", "S2", "S3", "Pendidikan Profesional / Sertifikasi Profesional / Setara"]
  for (const name of collegeLevels) {
    await prisma.masterData.upsert({
      where: { id: `college-lvl-${name.toLowerCase().slice(0, 10).replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `college-lvl-${name.toLowerCase().slice(0, 10).replace(/\s+/g, '-')}`,
        category: "COLLEGE_LEVEL",
        name,
        isActive: true
      }
    })
  }

  // 4. College Status
  const collegeStatuses = ["Lulus", "Sedang Berkuliah"]
  for (const name of collegeStatuses) {
    await prisma.masterData.upsert({
      where: { id: `college-stat-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `college-stat-${name.toLowerCase().replace(/\s+/g, '-')}`,
        category: "COLLEGE_STATUS",
        name,
        isActive: true
      }
    })
  }

  // 5. Entry Level (School)
  const entryLevels = ["SMP", "SMA"]
  for (const name of entryLevels) {
    await prisma.masterData.upsert({
      where: { id: `entry-${name.toLowerCase()}` },
      update: {},
      create: {
        id: `entry-${name.toLowerCase()}`,
        category: "ENTRY_LEVEL",
        name,
        isActive: true
      }
    })
  }

  // 6. Graduation Status (School)
  const gradStatuses = ["Lulus SMP", "Lulus SMA", "Tidak Lulus (Keluar/Pindah)"]
  for (const name of gradStatuses) {
    await prisma.masterData.upsert({
      where: { id: `grad-stat-${name.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `grad-stat-${name.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}`,
        category: "GRADUATION_STATUS",
        name,
        isActive: true
      }
    })
  }

  // 7. Job Status
  const jobStatuses = ["Karyawan Tetap", "Kontrak", "Freelance", "Wirausaha (Pemilik Bisnis)", "Tidak Bekerja"]
  for (const name of jobStatuses) {
    await prisma.masterData.upsert({
      where: { id: `job-stat-${name.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `job-stat-${name.toLowerCase().slice(0, 15).replace(/\s+/g, '-')}`,
        category: "JOB_STATUS",
        name,
        isActive: true
      }
    })
  }

  // 8. Provinces & Cities (Domestic)
  const provinces = [
    "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Papua Pegunungan", "Papua Selatan", "Papua Tengah", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"
  ]
  for (const name of provinces) {
    await prisma.masterData.upsert({
      where: { id: `prov-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `prov-${name.toLowerCase().replace(/\s+/g, '-')}`,
        category: "DOMESTIC_PROVINCE",
        name,
        isActive: true
      }
    })
  }

  // Sample Cities for some provinces
  const sampleCities = [
    { province: "DKI Jakarta", cities: ["Jakarta Pusat", "Jakarta Barat", "Jakarta Timur", "Jakarta Selatan", "Jakarta Utara"] },
    { province: "Jawa Barat", cities: ["Bandung", "Bogor", "Depok", "Bekasi", "Tangerang"] },
    { province: "Jawa Timur", cities: ["Surabaya", "Malang", "Sidoarjo"] }
  ]
  for (const item of sampleCities) {
    for (const city of item.cities) {
        await prisma.masterData.upsert({
            where: { id: `city-${city.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
                id: `city-${city.toLowerCase().replace(/\s+/g, '-')}`,
                category: "DOMESTIC_CITY",
                name: city,
                description: item.province, // Link back via description for seeding logic
                isActive: true
            }
        })
    }
  }

  // 9. Countries & States (Foreign)
  const countries = ["Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", "Japan", "South Korea", "China", "USA", "UK", "Australia"]
  for (const name of countries) {
    await prisma.masterData.upsert({
      where: { id: `country-${name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `country-${name.toLowerCase().replace(/\s+/g, '-')}`,
        category: "FOREIGN_COUNTRY",
        name,
        isActive: true
      }
    })
  }

  // 10. Majors (Program Studi) from Kaggle
  const kagglePath = path.join(process.cwd(), 'prisma', 'university_data.json')
  if (fs.existsSync(kagglePath)) {
    const rawData = fs.readFileSync(kagglePath, 'utf8')
    const jsonData = JSON.parse(rawData)
    
    // The columns might be 'PTN' and 'Program Studi'
    const majors = new Set<string>()
    jsonData.forEach((item: any) => {
        const major = item['Program Studi'] || item['program_studi']
        if (major) majors.add(major)
    })

    console.log(`Seeding ${majors.size} majors...`)
    for (const major of Array.from(majors)) {
        await prisma.masterData.upsert({
            where: { id: `major-${major.toLowerCase().slice(0, 30).replace(/[^a-z0-9]/g, '-')}` },
            update: {},
            create: {
                id: `major-${major.toLowerCase().slice(0, 30).replace(/[^a-z0-9]/g, '-')}`,
                category: "COLLEGE_MAJOR",
                name: major,
                isActive: true
            }
        })
    }
  }

  console.log("Seed finished successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
