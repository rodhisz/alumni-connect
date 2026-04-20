import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Optional: Security check to ensure it's called by Vercel Cron
// export const runtime = 'edge'; // Or nodejs

export async function GET(request: Request) {
  // Verifikasi request header Vercel CRON (Opsional tapi direkomendasikan untuk keamanan)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized cron trigger' }, { status: 401 })
  }

  try {
    // 1. Dapatkan daftar seluruh alumni
    const alumniList = await prisma.user.findMany({
      where: { role: "ALUMNI" },
      select: { email: true, name: true }
    })

    if (alumniList.length === 0) {
      return NextResponse.json({ success: true, message: "No alumni found to email." })
    }

    // 2. Simulasi: Kirim broadcast email (Di sini akan menembak Resend API)
    // Untuk tahap ini, kita hanya akan melakukan log ke Audit Log (Database)
    // agar kita punya bukti cron ini berjalan sukses pada environment Production.
    
    // In production, we would iterate and use Resend SDK:
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({...})

    const emailsToNotify = alumniList.map(a => a.email).join(", ")

    await prisma.auditLog.create({
      data: {
        action: "CRON_YEARLY_REMINDER",
        entityType: "System",
        entityId: "CronJob",
        changes: {
          targetCount: alumniList.length,
          status: "SIMULATED_SEND",
          note: "Cron job berhasil mengeksekusi iterasi ke " + alumniList.length + " entitas",
          emails: emailsToNotify.substring(0, 500) + (emailsToNotify.length > 500 ? "..." : "") // Limit string
        },
        userId: "system-cron"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Triggered yearly reminder for ${alumniList.length} alumni. Logs recorded.`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error("Cron Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
