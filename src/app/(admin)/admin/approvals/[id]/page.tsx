import { getRevisionDetails } from "@/core/actions/approvals"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import ApprovalReviewClient from "./ApprovalReviewClient"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function DetailApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: revision, error } = await getRevisionDetails(id)

  if (error || !revision) {
    redirect("/admin/approvals")
  }

  // Check if they are approver
  const session = await getServerSession(authOptions)
  const isApprover = await prisma.masterData.findFirst({
    where: { category: "APPROVER_EMAIL", name: session?.user?.email?.toLowerCase(), isActive: true }
  })
  const canApprove = !!isApprover || session?.user?.email === process.env.ADMIN_EMAIL


  
  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/admin/approvals" className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
              Tinjauan Perubahan Data
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {revision.fullName || revision.profile.fullName} ({revision.user.email})
            </p>
          </div>
        </div>

        <ApprovalReviewClient revision={revision} canApprove={canApprove} />

      </div>
    </div>
  )
}
