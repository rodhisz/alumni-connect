"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { activateAlumniAccount, checkActivationEmail } from "@/core/actions/auth"
import { AlertCircle, CheckCircle2, UserCheck, ArrowLeft, ArrowRight, ShieldCheck, Mail } from "lucide-react"
import { useLanguage } from "@/components/Providers"

export default function ActivationPage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [step, setStep] = useState(1) // 1: Email, 2: Password
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userData, setUserData] = useState<{name: string | null, email: string} | null>(null)
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await checkActivationEmail(email)
    if (res.success && res.user) {
      setUserData(res.user)
      setStep(2)
    } else {
      setError(t(res.error || "err_email_not_found"))
    }
    setLoading(false)
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError(lang === 'id' ? "Kata sandi dan konfirmasi tidak cocok." : "Passwords do not match.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError(lang === 'id' ? "Kata sandi minimal 6 karakter." : "Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    const res = await activateAlumniAccount(email, password)

    if (res.success) {
      setSuccess(true)
    } else {
      setError(t(res.error || "err_activation_failed"))
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="glass border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 w-full">
          
          <Link href={step === 2 ? "#" : "/login"} 
                onClick={(e) => { if(step === 2) { e.preventDefault(); setStep(1); setError(""); } }}
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft size={16} />
            {step === 2 ? t("change_email") : t("back")}
          </Link>

          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${step === 2 ? 'bg-blue-600' : 'bg-emerald-600'} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg transition-colors`}>
              {step === 2 ? <ShieldCheck size={32} /> : <UserCheck size={32} />}
            </div>
            <h1 className="text-2xl font-outfit font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{t("account_activation")}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
                {step === 1 
                    ? t("activation_step1_desc") 
                    : t("activation_step2_desc").replace("{name}", userData?.name || "")}
            </p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t("activation_success_title")}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                {t("activation_success_desc")}
              </p>
              <Link 
                href="/login"
                className="w-full flex justify-center items-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
              >
                {t("go_to_login")}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20 flex gap-3 items-start">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleCheckEmail} className="space-y-5 text-center">
                    <div className="text-left">
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                            {t("email_invitation_label")}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input 
                                required
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-all"
                                placeholder="nama@email.com"
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? t("checking_database") : (
                            <>
                                <span>{t("continue")}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{t("only_invited_email_notice")}</p>
                </form>
              ) : (
                <form onSubmit={handleActivate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                            {t("create_password_label")}
                        </label>
                        <input 
                            required
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                            placeholder={lang === 'id' ? "Minimal 6 karakter" : "Min 6 characters"}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                            {t("confirm_password")}
                        </label>
                        <input 
                            required
                            type="password" 
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
                            placeholder={lang === 'id' ? "Ulangi sandi" : "Repeat password"}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-2 flex justify-center items-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {loading ? t("saving_data") : t("finish_activation")}
                    </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
