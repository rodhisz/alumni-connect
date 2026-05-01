import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DB_URL || process.env.DATABASE_URL
  // Trigger reload: 2026-04-25T08:54:00
  console.log(`[PRISMA DEBUG] INIT CLIENT - HOST: ${connectionString?.split('@')[1]}`)
  const pool = new Pool({ 
    connectionString: connectionString!,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    ssl: {
      rejectUnauthorized: false
    }
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Force clear cached Prisma client to ensure schema updates take effect
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = undefined;
}
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
