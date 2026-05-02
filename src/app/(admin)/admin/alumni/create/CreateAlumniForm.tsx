"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createFullAlumni } from "@/core/actions/alumni"
import { getMasterData } from "@/core/actions/master-data"
import { AlertCircle, Save, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/Providers"
import type { Category } from "@prisma/client"

type Option = { value: string; label: string }
type OptionsDict = Record<string, Option[]>

export default function CreateAlumniForm({ options }: { options: OptionsDict }) {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [provinces] = useState<Option[]>(options.PROVINCE || [])
  const [cities, setCities] = useState<Option[]>([])
  const [countries] = useState<Option[]>(options.COUNTRY || [])
  const [states, setStates] = useState<Option[]>([])
  
  const [fetchLoading, setFetchLoading] = useState({ 
    cities: false, states: false 
  })

  const [formData, setFormData] = useState<any>({
    email: "", fullName: "", phoneNumber: "", citizenship: "",
    maritalStatusId: "", isMale: true, startYear: "", graduationYear: "",
    highestEducation: "", entryLevelId: "", graduationStatusId: "",
    domicileType: "DOMESTIC", 
    provinceId: "", provinceName: "", cityId: "", cityName: "", 
    countryId: "", countryName: "", stateId: "", stateName: "",
    activityStatus: "",
    universityId: "", otherUniversity: "", 
    collegeLevelId: "", majorId: "", otherMajor: "", collegeStatusId: "",
    companyName: "", jobPosition: "", jobStatusId: ""
  })

  useEffect(() => {
    if (!formData.provinceId || formData.domicileType !== "DOMESTIC") { setCities([]); return }
    const fetchCities = async () => {
      setFetchLoading(prev => ({ ...prev, cities: true }))
      const res = await getMasterData("CITY" as Category, formData.provinceName)
      if (res.success && res.data) {
        setCities(res.data.map((c: any) => ({ value: c.id, label: c.name })))
      }
      setFetchLoading(prev => ({ ...prev, cities: false }))
    }
    fetchCities()
  }, [formData.provinceId, formData.provinceName, formData.domicileType])

  useEffect(() => {
    if (!formData.countryId || formData.domicileType !== "FOREIGN") { setStates([]); return }
    const fetchStates = async () => {
      setFetchLoading(prev => ({ ...prev, states: true }))
      const res = await getMasterData("STATE" as Category, formData.countryName)
      if (res.success && res.data) {
        setStates(res.data.map((s: any) => ({ value: s.id, label: s.name })))
      }
      setFetchLoading(prev => ({ ...prev, states: false }))
    }
    fetchStates()
  }, [formData.countryId, formData.countryName, formData.domicileType])

  const currentYear = new Date().getFullYear()
  const startYearOptions = Array.from({ length: currentYear - 2013 + 1 }, (_, i) => currentYear - i)
  const graduationYearOptions = Array.from({ length: currentYear - 2018 + 1 }, (_, i) => currentYear - i)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "domicileType") {
      setFormData({ ...formData, domicileType: value, provinceId: "", provinceName: "", cityId: "", cityName: "", countryId: "", countryName: "", stateId: "", stateName: "" })
    } else if (name === "provinceId") {
      const selected = provinces.find(p => p.value === value)
      setFormData({ ...formData, provinceId: value, provinceName: selected ? selected.label : "", cityId: "", cityName: "" })
    } else if (name === "cityId") {
      const selected = cities.find(c => c.value === value)
      setFormData({ ...formData, cityId: value, cityName: selected ? selected.label : "" })
    } else if (name === "countryId") {
      const selected = countries.find(c => c.value === value)
      setFormData({ ...formData, countryId: value, countryName: selected ? selected.label : "", stateId: "", stateName: "" })
    } else if (name === "stateId") {
      const selected = states.find(s => s.value === value)
      setFormData({ ...formData, stateId: value, stateName: selected ? selected.label : "" })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    const res = await createFullAlumni(formData)
    if (res.success) {
      router.push("/admin/alumni")
    } else {
      setErrorMsg(res.error || t("error_occurred"))
      setLoading(false)
    }
  }

  const lbl = "block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase"
  const inp = "w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 text-sm"
  const sel = inp
  const sectionHead = "text-xl font-outfit font-bold mb-6 text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-4"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex gap-3 items-start">
          <AlertCircle size={20} className="shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* A. Data Pribadi */}
      <section className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className={sectionHead}>{t("section_personal")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={lbl}>{t("full_name")} *</label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inp} placeholder={lang === "id" ? "Sesuai Ijazah" : "As per certificate"} />
          </div>
          <div>
            <label className={lbl}>{t("email")} *</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inp} placeholder="email@example.com" />
          </div>
          <div>
            <label className={lbl}>{t("phone_number")} *</label>
            <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inp} placeholder="0812xxxxxx" />
          </div>
          <div>
            <label className={lbl}>{t("citizenship")} *</label>
            <select required name="citizenship" value={formData.citizenship} onChange={handleChange} className={inp}>
              <option value="">-- {lang === "id" ? "Pilih" : "Select"} --</option>
              <option value="WNI">{t("wni")}</option>
              <option value="WNA">{t("wna")}</option>
            </select>
          </div>
          <div>
            <label className={lbl}>{t("marital_status")} *</label>
            <select required name="maritalStatusId" value={formData.maritalStatusId} onChange={handleChange} className={sel}>
              <option value="">-- {t("search")} --</option>
              {(options.MARITAL_STATUS || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>{lang === "id" ? "Jenis Kelamin" : "Gender"} *</label>
            <select required name="isMale" value={formData.isMale ? "true" : "false"} onChange={(e) => setFormData({...formData, isMale: e.target.value === "true"})} className={inp}>
              <option value="true">{lang === "id" ? "Putra (Laki-laki)" : "Male"}</option>
              <option value="false">{lang === "id" ? "Putri (Perempuan)" : "Female"}</option>
            </select>
          </div>
        </div>
      </section>

      {/* B. Data Kealumnian */}
      <section className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className={sectionHead}>{t("section_academic")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={lbl}>{t("start_year")} *</label>
            <select required name="startYear" value={formData.startYear} onChange={handleChange} className={sel}>
              <option value="">-- {lang === "id" ? "Pilih Tahun" : "Select Year"} --</option>
              {startYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>{t("graduation_year")} *</label>
            <select required name="graduationYear" value={formData.graduationYear} onChange={handleChange} className={sel}>
              <option value="">-- {lang === "id" ? "Pilih Tahun" : "Select Year"} --</option>
              <option value="Tidak Menyelesaikan Studi">{lang === "id" ? "Tidak Menyelesaikan Studi" : "Did Not Complete Studies"}</option>
              {graduationYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>{t("highest_education")} *</label>
            <select required name="highestEducation" value={formData.highestEducation} onChange={handleChange} className={sel}>
              <option value="">-- {lang === "id" ? "Pilih Jenjang" : "Select Level"} --</option>
              <option value="SMP_7">{lang === "id" ? "SMP Kelas 7" : "Junior High Grade 7"}</option>
              <option value="SMP_8">{lang === "id" ? "SMP Kelas 8" : "Junior High Grade 8"}</option>
              <option value="SMP_9">{lang === "id" ? "SMP Kelas 9" : "Junior High Grade 9"}</option>
              <option value="SMA_10">{lang === "id" ? "SMA Kelas 10" : "Senior High Grade 10"}</option>
              <option value="SMA_11">{lang === "id" ? "SMA Kelas 11" : "Senior High Grade 11"}</option>
              <option value="SMA_12">{lang === "id" ? "SMA Kelas 12" : "Senior High Grade 12"}</option>
            </select>
          </div>
          <div>
            <label className={lbl}>{t("entry_level")} *</label>
            <select required name="entryLevelId" value={formData.entryLevelId} onChange={handleChange} className={sel}>
              <option value="">-- {lang === "id" ? "Pilih Jenjang" : "Select Level"} --</option>
              {(options.ENTRY_LEVEL || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>{t("graduation_status")} *</label>
            <select required name="graduationStatusId" value={formData.graduationStatusId} onChange={handleChange} className={sel}>
              <option value="">-- {lang === "id" ? "Pilih Status" : "Select Status"} --</option>
              {(options.GRADUATION_STATUS || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* C. Domisili */}
      <section className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className={sectionHead}>{t("section_domicile")}</h2>
        <div className="mb-6 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="domicileType" value="DOMESTIC" checked={formData.domicileType === "DOMESTIC"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{t("domestic")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="domicileType" value="FOREIGN" checked={formData.domicileType === "FOREIGN"} onChange={handleChange} className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">{t("foreign")}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formData.domicileType === "DOMESTIC" ? (
            <>
              <div>
                <label className={`${lbl} flex justify-between`}>
                  {t("province")} *
                </label>
                <select required name="provinceId" value={formData.provinceId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih Provinsi" : "Select Province"} --</option>
                  {provinces.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`${lbl} flex justify-between`}>
                  {t("city")} * {fetchLoading.cities && <Loader2 size={12} className="animate-spin" />}
                </label>
                <select required name="cityId" value={formData.cityId} onChange={handleChange} className={sel} disabled={!formData.provinceId}>
                  <option value="">-- {formData.provinceId ? (lang === "id" ? "Pilih Kota" : "Select City") : (lang === "id" ? "Pilih Provinsi Dulu" : "Select Province First")} --</option>
                  {cities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={`${lbl} flex justify-between`}>
                  {t("country")} *
                </label>
                <select required name="countryId" value={formData.countryId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih Negara" : "Select Country"} --</option>
                  {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={`${lbl} flex justify-between`}>
                  {t("state")} * {fetchLoading.states && <Loader2 size={12} className="animate-spin" />}
                </label>
                <select required name="stateId" value={formData.stateId} onChange={handleChange} className={sel} disabled={!formData.countryId}>
                  <option value="">-- {formData.countryId ? (lang === "id" ? "Pilih Wilayah" : "Select Region") : (lang === "id" ? "Pilih Negara Dulu" : "Select Country First")} --</option>
                  {states.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {/* D. Kegiatan Saat Ini */}
      <section className="glass rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className={sectionHead}>{t("section_activity")}</h2>
        
        <div className="mb-6">
          <label className={lbl}>{t("activity_status")} *</label>
          <select required name="activityStatus" value={formData.activityStatus} onChange={handleChange} className={`${sel} md:w-1/2`}>
            <option value="">-- {lang === "id" ? "Pilih Status" : "Select Status"} --</option>
            <option value="COLLEGE">{t("college")}</option>
            <option value="WORKING">{t("working")}</option>
            <option value="COLLEGE_AND_WORKING">{t("college_and_working")}</option>
          </select>
        </div>

        {(formData.activityStatus === "COLLEGE" || formData.activityStatus === "COLLEGE_AND_WORKING") && (
          <div className="mt-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 bg-white/50 dark:bg-zinc-900/50">
            <h3 className="font-semibold text-sm mb-4 text-blue-600">{lang === "id" ? "Detail Perkuliahan" : "College Details"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("university")} *</label>
                <select required name="universityId" value={formData.universityId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih Universitas" : "Select University"} --</option>
                  {(options.UNIVERSITY || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {options.UNIVERSITY?.find(o => o.value === formData.universityId)?.label === "Lainnya" && (
                  <input required type="text" name="otherUniversity" value={formData.otherUniversity} onChange={handleChange} className={`${sel} mt-2 border-blue-200`} placeholder={lang === "id" ? "Masukkan Nama Universitas..." : "Enter University Name..."} />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("college_level")} *</label>
                <select required name="collegeLevelId" value={formData.collegeLevelId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih" : "Select"} --</option>
                  {(options.COLLEGE_LEVEL || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("major")} *</label>
                <select required name="majorId" value={formData.majorId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih" : "Select"} --</option>
                  {(options.COLLEGE_MAJOR || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                {options.COLLEGE_MAJOR?.find(o => o.value === formData.majorId)?.label === "Lainnya" && (
                  <input required type="text" name="otherMajor" value={formData.otherMajor} onChange={handleChange} className={`${sel} mt-2 border-blue-200`} placeholder={lang === "id" ? "Masukkan Jurusan..." : "Enter Study Program..."} />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("college_status")} *</label>
                <select required name="collegeStatusId" value={formData.collegeStatusId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih" : "Select"} --</option>
                  {(options.COLLEGE_STATUS || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {(formData.activityStatus === "WORKING" || formData.activityStatus === "COLLEGE_AND_WORKING") && (
          <div className="mt-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 bg-white/50 dark:bg-zinc-900/50">
            <h3 className="font-semibold text-sm mb-4 text-emerald-600">{lang === "id" ? "Detail Pekerjaan" : "Work Details"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("company")} *</label>
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={sel} placeholder={lang === "id" ? "Contoh: PT. Alumni Connect" : "e.g. Alumni Connect Inc."} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("job_status")} *</label>
                <select required name="jobStatusId" value={formData.jobStatusId} onChange={handleChange} className={sel}>
                  <option value="">-- {lang === "id" ? "Pilih" : "Select"} --</option>
                  {(options.JOB_STATUS || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-500 mb-1">{t("job_position")} *</label>
                <input required type="text" name="jobPosition" value={formData.jobPosition} onChange={handleChange} className={sel} placeholder={lang === "id" ? "Contoh: Software Engineer" : "e.g. Software Engineer"} />
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end gap-4 p-6 glass border border-zinc-200 dark:border-zinc-800 rounded-3xl sticky bottom-4 z-40 shadow-2xl">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          {t("cancel")}
        </button>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50">
          <Save size={18} />
          {loading ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  )
}
