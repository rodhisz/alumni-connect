import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Cleaning up MasterData categories...')
  await prisma.masterData.deleteMany({
    where: {
      category: {
        in: ['DOMESTIC_PROVINCE', 'DOMESTIC_CITY', 'FOREIGN_COUNTRY', 'FOREIGN_STATE'] as any
      }
    }
  })
  console.log('Done.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
