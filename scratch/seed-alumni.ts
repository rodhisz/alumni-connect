import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding 200 FULL alumni records...")
  
  const names = ["Ahmad", "Budi", "Siti", "Dewi", "Eko", "Fajar", "Gita", "Hana", "Indra", "Joko", "Kartika", "Lestari", "Maulana", "Novi", "Oki", "Putri", "Rian", "Sari", "Taufiq", "Utami"]
  const lastNames = ["Santoso", "Wijaya", "Pratama", "Hidayat", "Saputra", "Kusuma", "Lestari", "Nugroho", "Rahayu", "Setiawan"]
  
  // Get some master data IDs to play with
  const ms = await prisma.masterData.findMany({ where: { category: "MARITAL_STATUS" } })
  const el = await prisma.masterData.findMany({ where: { category: "ENTRY_LEVEL" } })
  const gs = await prisma.masterData.findMany({ where: { category: "GRADUATION_STATUS" } })
  const js = await prisma.masterData.findMany({ where: { category: "JOB_STATUS" } })

  for (let i = 0; i < 200; i++) {
    const firstName = names[Math.floor(Math.random() * names.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName} ${i+1}`
    const email = `alumni_full_${i+1}@test.com`
    
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: fullName,
        role: "ALUMNI",
        profile: {
          create: {
            fullName,
            status: "APPROVED",
            phoneNumber: `0812${1000000 + i}`,
            startYear: 2010 + Math.floor(Math.random() * 10),
            graduationYear: (2014 + Math.floor(Math.random() * 10)).toString(),
            highestEducation: i % 2 === 0 ? "SMA_12" : "SMA_11",
            citizenship: "WNI",
            domicileType: i % 5 === 0 ? "FOREIGN" : "DOMESTIC",
            provinceName: i % 5 === 0 ? null : "DKI Jakarta",
            cityName: i % 5 === 0 ? null : "Jakarta Selatan",
            countryName: i % 5 === 0 ? "Singapore" : null,
            stateName: i % 5 === 0 ? "Central" : null,
            activityStatus: i % 3 === 0 ? "WORKING" : (i % 3 === 1 ? "COLLEGE" : "COLLEGE_AND_WORKING"),
            companyName: i % 3 !== 1 ? "PT. Teknologi " + (i+1) : null,
            jobPosition: i % 3 !== 1 ? "Software Engineer" : null,
            otherUniversity: i % 3 !== 0 ? "Universitas Indonesia" : null,
            otherMajor: i % 3 !== 0 ? "Teknik Informatika" : null,
            maritalStatusId: ms.length > 0 ? ms[i % ms.length].id : null,
            entryLevelId: el.length > 0 ? el[i % el.length].id : null,
            graduationStatusId: gs.length > 0 ? gs[i % gs.length].id : null,
            jobStatusId: i % 3 !== 1 && js.length > 0 ? js[i % js.length].id : null
          }
        }
      }
    })
  }
  
  console.log("Full Seeding complete.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
