import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function isSuperuser() {
  const session = await getServerSession(authOptions)
  return session && (session.user as any).role === "SUPERUSER"
}

// PATCH — update widget
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isSuperuser()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { id } = await params
    const body = await req.json()
    const widget = await prisma.dashboardWidget.update({ where: { id }, data: body })
    return NextResponse.json(widget)
  } catch (err: any) {
    console.error("Widget PATCH Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — soft delete
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await isSuperuser()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { id } = await params
    await prisma.dashboardWidget.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Widget DELETE Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
