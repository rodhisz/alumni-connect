"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function activateAlumniAccount(email: string, passwordString: string) {
  if (!email || !passwordString) return { success: false, error: "Required" }

  try {
    const canonicalEmail = email.toLowerCase()
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: canonicalEmail }
    })

    if (!user) {
      return { success: false, error: "err_email_not_found" }
    }

    if (user.passwordHash) {
      return { success: false, error: "err_already_activated" }
    }

    // Set password
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(passwordString, salt)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash }
    })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: "err_activation_failed" }
  }
}

export async function checkActivationEmail(email: string) {
  if (!email) return { success: false, error: "Required" }

  try {
    const canonicalEmail = email.toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: canonicalEmail }
    })

    if (!user) {
      return { success: false, error: "err_email_not_found" }
    }

    if (user.passwordHash) {
      return { success: false, error: "err_already_activated" }
    }

    return { success: true, user: { name: user.name, email: user.email } }
  } catch (e: any) {
    return { success: false, error: "error_occurred" }
  }
}
