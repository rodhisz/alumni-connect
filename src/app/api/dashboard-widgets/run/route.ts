import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateSqlFromBuilder } from "@/lib/widget-engine"

function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "bigint") return obj.toString()
  if (Array.isArray(obj)) return obj.map(serializeBigInt)
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    )
  }
  return obj
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPERUSER", "ADMIN"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { query, widgetId, builderConfig } = body as { query?: string, widgetId?: string, builderConfig?: any }

  let sqlToRun = query

  if (widgetId) {
    const widget = await prisma.dashboardWidget.findUnique({ where: { id: widgetId } })
    if (widget) {
      sqlToRun = widget.useRawQuery ? widget.sqlQuery : generateSqlFromBuilder(widget.builderConfig as any)
    }
  } else if (builderConfig) {
    sqlToRun = generateSqlFromBuilder(builderConfig)
  }

  if (!sqlToRun?.trim()) {
    return NextResponse.json({ error: "No query or configuration provided" }, { status: 400 })
  }

  // Safety: block mutating statements
  const normalized = sqlToRun.trim().toUpperCase()
  const mutating = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE"]
  for (const kw of mutating) {
    if (normalized.startsWith(kw) || normalized.includes(` ${kw} `)) {
      return NextResponse.json({ error: `Mutating statement "${kw}" is not allowed.` }, { status: 400 })
    }
  }

  try {
    const result = await prisma.$queryRawUnsafe(sqlToRun)
    return NextResponse.json({ data: serializeBigInt(result) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
