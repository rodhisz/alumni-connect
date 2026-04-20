"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, LogIn, ShieldCheck, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { t, lang } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password
    })

    if (res?.error) {
      setError(lang === "id" ? "Email atau password tidak valid, harap coba lagi." : "Invalid email or password, please try again.")
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all font-bold text-sm tracking-tight px-2 group"
        >
          <div className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft size={16} />
          </div>
          {lang === 'id' ? "KEMBALI KE BERANDA" : "BACK TO HOME"}
        </Link>

        <div className="glass border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-outfit font-bold text-zinc-900 dark:text-white">
              {lang === "id" ? "Selamat Datang" : "Welcome Back"}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
              {lang === "id" ? "Masuk ke portal Alumni Connect" : "Log in to Alumni Connect portal"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20 flex gap-3 items-center">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                {lang === "id" ? "Alamat Email" : "Email Address"}
              </label>
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                {lang === "id" ? "Kata Sandi" : "Password"}
              </label>
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {loading ? (lang === "id" ? "Memverifikasi..." : "Verifying...") : (
                <>
                  <LogIn size={18} />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {lang === "id" ? "Belum memiliki kata sandi?" : "Don't have a password yet?"}{" "}
              <Link href="/aktivasi" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {lang === "id" ? "Aktivasi Akun" : "Account Activation"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
