import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/settings — public read (for home page)
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value ?? ""
    }
    return NextResponse.json(map)
  } catch (err: any) {
    console.error("Settings GET Error:", err)
    return NextResponse.json({}, { status: 200 }) // Return empty map instead of error to avoid home page crash
  }
}

// POST /api/settings — superuser only, upsert key-value pairs
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = session?.user ? (session.user as any).role : null
    if (!session || (userRole !== "SUPERUSER" && userRole !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json() as Record<string, string>
    const ops = Object.entries(body).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
    await Promise.all(ops)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Settings POST Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
