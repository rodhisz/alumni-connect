import { PrismaClient, UserRole, ApprovalStatus, ActivityStatus, DomisiliType, HighestEducation, Category } from "@prisma/client"
import { config } from "dotenv"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from "bcryptjs"

config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const FIRST_NAMES = ["Andi", "Budi", "Citra", "Diana", "Eko", "Fajri", "Gita", "Hana", "Indra", "Joko", "Kurnia", "Lestari", "Maya", "Novi", "Oscar", "Putra", "Rina", "Santi", "Taufik", "Utami", "Vino", "Wati", "Yanto", "Zaki"]
const LAST_NAMES = ["Saputra", "Wibowo", "Lestari", "Hidayat", "Pratama", "Kusuma", "Santoso", "Sari", "Wijaya", "Purnama", "Setiawan", "Ramadhan", "Fitriani", "Nugroho"]

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

async function main() {
  console.log("🚀 Starting API-Integrated Seed...")

  async function safeUpsertMaster(category: Category, name: string) {
    return await prisma.masterData.upsert({
      where: { category_name: { category, name } },
      update: { isActive: true },
      create: { 
        category, 
        name, 
        isActive: true,
        id: `${category.toLowerCase()}-${name.toLowerCase().slice(0, 20).replace(/[^a-z0-9]/g, '-')}` 
      }
    })
  }

  // --- 1. Master Data ---
  console.log("📦 Seeding Master Data...")
  const maritalIds = []
  for (const n of ["Kawin", "Belum Kawin", "Cerai Hidup"]) maritalIds.push((await safeUpsertMaster("MARITAL_STATUS", n)).id)

  const collegeLvlIds = []
  for (const n of ["D3", "S1", "S2", "S3"]) collegeLvlIds.push((await safeUpsertMaster("COLLEGE_LEVEL", n)).id)

  const collegeStatIds = []
  for (const n of ["Lulus", "Sedang Berkuliah"]) collegeStatIds.push((await safeUpsertMaster("COLLEGE_STATUS", n)).id)

  const entryLvlIds = []
  for (const n of ["SMP", "SMA"]) entryLvlIds.push((await safeUpsertMaster("ENTRY_LEVEL", n)).id)

  const jobStatIds = []
  for (const n of ["Karyawan Tetap", "Kontrak", "Freelance", "Wirausaha"]) jobStatIds.push((await safeUpsertMaster("JOB_STATUS", n)).id)

  const univIds = []
  for (const n of ["UI", "ITB", "UGM", "NTU", "Harvard", "Oxford"]) univIds.push((await safeUpsertMaster("UNIVERSITY", n)).id)

  const majorIds = []
  for (const n of ["Informatika", "Manajemen", "Kedokteran", "Psikologi", "Akuntansi", "DKV"]) majorIds.push((await safeUpsertMaster("COLLEGE_MAJOR", n)).id)

  const gradStatId = (await safeUpsertMaster("GRADUATION_STATUS", "Lulus SMA")).id

  // --- 2. Fetch Locations from API ---
  console.log("🌍 Fetching Provinces and Countries from API...")
  let apiProvinces: any[] = []
  let apiCountries: any[] = []

  try {
    const pRes = await fetch("https://wilayah.id/api/provinces.json")
    const pJson = await pRes.json()
    apiProvinces = pJson.data || []
  } catch (e) {
    console.error("Failed to fetch provinces, using fallback")
    apiProvinces = [{ code: "31", name: "DKI JAKARTA" }, { code: "32", name: "JAWA BARAT" }]
  }

  try {
    const cRes = await fetch("https://countriesnow.space/api/v0.1/countries/iso")
    const cJson = await cRes.json()
    apiCountries = cJson.data || []
  } catch (e) {
    console.error("Failed to fetch countries, using fallback")
    apiCountries = [{ name: "Japan" }, { name: "United States" }]
  }

  // --- 3. Site Settings ---
  console.log("⚙️ Seeding Site Settings...")
  const settings = [
    { key: "site_name", value: "Alumni Connect" },
    { key: "home_app_name", value: "Alumni Connect" },
    { key: "site_description", value: "Platform resmi kolaborasi dan silaturahmi seluruh alumni." },
    { key: "theme_color", value: "#10b981" },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    })
  }

  // --- 4. Dashboard Widgets ---
  const widgets = [
    { name: "Total Alumni", chartType: "number", sqlQuery: "SELECT COUNT(*) as value FROM \"AlumniProfile\" WHERE status = 'APPROVED'", order: 1 },
    { name: "Working Alumni", chartType: "number", sqlQuery: "SELECT COUNT(*) as value FROM \"AlumniProfile\" WHERE \"activityStatus\" IN ('WORKING', 'COLLEGE_AND_WORKING') AND status = 'APPROVED'", order: 2 },
    { name: "Continuing Studies", chartType: "number", sqlQuery: "SELECT COUNT(*) as value FROM \"AlumniProfile\" WHERE \"activityStatus\" IN ('COLLEGE', 'COLLEGE_AND_WORKING') AND status = 'APPROVED'", order: 3 },
    { name: "Locations", chartType: "number", sqlQuery: "SELECT COUNT(DISTINCT \"provinceName\") + COUNT(DISTINCT \"countryName\") as value FROM \"AlumniProfile\" WHERE status = 'APPROVED'", order: 4 },
  ]
  for (const w of widgets) {
    await prisma.dashboardWidget.upsert({
      where: { id: `widget-${w.name.toLowerCase().replace(/\s/g, '-')}` },
      update: { sqlQuery: w.sqlQuery, order: w.order },
      create: { 
        id: `widget-${w.name.toLowerCase().replace(/\s/g, '-')}`,
        name: w.name, 
        chartType: w.chartType, 
        sqlQuery: w.sqlQuery, 
        order: w.order, 
        isActive: true 
      }
    })
  }

  // --- 5. Admin User ---
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@alumni.com" },
    update: {},
    create: { email: "admin@alumni.com", name: "Super Admin", role: "SUPERUSER", passwordHash: adminPassword }
  })

  // --- 6. Random Alumni with Realistic Data ---
  console.log("👥 Seeding 50 Alumni with API locations...")
  const passwordHash = await bcrypt.hash("admin123", 10)
  
  for (let i = 1; i <= 50; i++) {
    const isDomestic = Math.random() > 0.2
    const firstName = getRandom(FIRST_NAMES)
    const lastName = getRandom(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`
    const email = `alumni${i}@example.com`

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { 
        email, 
        name: fullName, 
        role: "ALUMNI", 
        passwordHash,
        profile: {
          create: {
            fullName,
            status: "APPROVED",
            isMale: Math.random() > 0.5,
            startYear: 2013 + Math.floor(Math.random() * 8),
            graduationYear: (2018 + Math.floor(Math.random() * 7)).toString(),
            domicileType: isDomestic ? "DOMESTIC" : "FOREIGN",
            provinceId: isDomestic ? getRandom(apiProvinces).code : null,
            provinceName: isDomestic ? toTitleCase(getRandom(apiProvinces).name) : null,
            countryName: !isDomestic ? getRandom(apiCountries).name : null,
            activityStatus: getRandom(["WORKING", "COLLEGE", "COLLEGE_AND_WORKING"]),
            companyName: Math.random() > 0.3 ? "PT. Teknologi Indonesia" : null,
            jobPosition: Math.random() > 0.3 ? "Software Engineer" : null,
            universityId: getRandom(univIds),
            majorId: getRandom(majorIds)
          }
        }
      }
    })
  }

  console.log("✅ Seed finished successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
