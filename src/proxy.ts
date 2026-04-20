import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Protected paths
  const isAdminPath = pathname.startsWith("/admin")
  const isDashboardPath = pathname.startsWith("/dashboard")

  if (!token && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token) {
    // If Admin/SuperUser tries to access Dashboard (Alumni specialized area if any)
    if (isDashboardPath && (token.role === "ADMIN" || token.role === "SUPERUSER")) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
    
    // If non-admin tries to access Admin
    if (isAdminPath && token.role !== "ADMIN" && token.role !== "SUPERUSER" && token.role !== "ALUMNI") {
       // Note: Currently we allow ALUMNI to /admin because of common dashboard 
       // but restricted UI. If truly restricted, filter here.
    }
    
    // Redirect authenticated users away from auth pages
    if (pathname === "/login" || pathname === "/aktivasi") {
      if (token.role === "ADMIN" || token.role === "SUPERUSER") return NextResponse.redirect(new URL("/admin", req.url))
      return NextResponse.redirect(new URL("/admin", req.url)) // Or their respective portal
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/aktivasi"],
}
