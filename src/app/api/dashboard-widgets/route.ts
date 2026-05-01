import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function isSuperuser(req: NextRequest) {
  const session = await getServerSession(authOptions)
  return session && (session.user as any).role === "SUPERUSER"
}

// GET — list widgets
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPERUSER", "ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const widgets = await prisma.dashboardWidget.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })
    return NextResponse.json(widgets)
  } catch (err: any) {
    console.error("Dashboard Widget GET Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — create widget (superuser only)
export async function POST(req: NextRequest) {
  try {
    if (!await isSuperuser(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const body = await req.json()
    const widget = await prisma.dashboardWidget.create({ data: body })
    return NextResponse.json(widget)
  } catch (err: any) {
    console.error("Dashboard Widget POST Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
