import { Category } from "@prisma/client"

export const CATEGORY_LABELS: Record<Category, string> = {
  MARITAL_STATUS: "Status Perkawinan",
  ENTRY_LEVEL: "Asal Jenjang (SMP/SMA)",
  GRADUATION_STATUS: "Status Kelulusan",
  COLLEGE_LEVEL: "Jenjang Perguruan Tinggi",
  COLLEGE_MAJOR: "Program Studi",
  COLLEGE_STATUS: "Status Kuliah",
  JOB_STATUS: "Status Pekerjaan",
  UNIVERSITY: "Universitas / Perguruan Tinggi",
  APPROVER_EMAIL: "Email Penyetuju"
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as Category,
  label
}))

export const EDUCATION_LABELS: Record<string, { id: string, en: string }> = {
  SMP_7: { id: "SMP Kelas 7", en: "Grade 7 (Middle School)" },
  SMP_8: { id: "SMP Kelas 8", en: "Grade 8 (Middle School)" },
  SMP_9: { id: "SMP Kelas 9", en: "Grade 9 (Middle School)" },
  SMA_10: { id: "SMA Kelas 10", en: "Grade 10 (High School)" },
  SMA_11: { id: "SMA Kelas 11", en: "Grade 11 (High School)" },
  SMA_12: { id: "SMA Kelas 12", en: "Grade 12 (High School)" },
}
