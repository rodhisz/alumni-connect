import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email Access",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "alumni@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })
        
        if (!user || !user.passwordHash) {
          // If no user or no password set via inject, reject
          return null
        }
        
        const isPasswordValid = bcrypt.compareSync(credentials.password, user.passwordHash)
        
        console.log(`[AUTH DEBUG] Attempt for: ${credentials.email}, User Found: ${!!user}, Hash Found: ${!!user.passwordHash}, Valid: ${isPasswordValid}`)
        
        if (isPasswordValid) {
          // Identify their role context
          let role = user.role as string;
          
          // If in approver list, ensure they have at least ADMIN role for UI purposes
          // unless they are already SUPERUSER
          try {
            const approver = await prisma.masterData.findFirst({
              where: { category: "APPROVER_EMAIL", name: credentials.email.toLowerCase(), isActive: true }
            })
            
            if (approver && role === "ALUMNI") {
              role = "ADMIN";
            }
            console.log(`[AUTH DEBUG] Approver Check: ${!!approver}, Target Role: ${role}`)
          } catch (approverErr) {
            console.error(`[AUTH DEBUG] Approver Check Error:`, approverErr)
            // Continue even if check fails, as they have a base role
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: role,
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // To be created
  }
}
