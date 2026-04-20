const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const masterData = await prisma.masterData.findMany()
  const seen = new Set()
  const toDelete = []

  for (const item of masterData) {
    const key = `${item.category}_${item.name}`
    if (seen.has(key)) {
      toDelete.push(item.id)
    } else {
      seen.add(key)
    }
  }

  console.log(`Found ${toDelete.length} duplicates to delete.`)
  if (toDelete.length > 0) {
    await prisma.masterData.deleteMany({
      where: {
        id: { in: toDelete }
      }
    })
    console.log('Duplicates deleted.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
