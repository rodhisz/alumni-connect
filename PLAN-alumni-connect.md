# Project Plan: Alumni Connect

## 📖 Overview
"Alumni Connect" adalah platform manajemen data alumni berskala besar dengan fokus pada keamanan (*Security*), fleksibilitas kustomisasi UI yang premium (termasuk kelengkapan *Dark Mode* dan Peta Interaktif), serta keutuhan data (*Data Integrity*). Proyek ini memfasilitasi admin untuk memvalidasi *request edit* dari alumni dengan fitur pemantauan rekam jejak revisi (*Audit Log*), dan fitur *auto-remind* tahunan bagi seluruh alumni melalui *Cron Job*.

## 🏗️ Project Type
**WEB** (Full-Stack Next.js Application)

## 🎯 Success Criteria
- **Security:** Alumni hanya bisa reset password melalui email yang di-inject oleh admin. Data di-hash dan diverifikasi saat ada perubahan.
- **Data Workflow:** Alumni dapat mengajukan *edit* data, yang statusnya akan menjadi "Waiting for approval" sehingga tidak bisa di-request ulang hingga dikonfirmasi / disahkan Admin. Riwayat perubahan data (*Audit Log*) tercatat lengkap.
- **Dashboard & Peta:** Dashboard publik menampilkan rekap angka (tanpa identitas) dengan peta dunia interaktif menggunakan library Open-Source.
- **Automation:** Email pengingat tahunan berjalan otomatis, mengecek dan mengirim sirkuler agar alumni memutakhirkan data mereka.
- **UI/UX Premium:** Tampilan sepenuhnya kustom dan responsif (Mobile & Laptop) dengan desain visual tingkat lanjut.

## 🛠️ Tech Stack & Rationale
- **Framework:** Next.js (React) - Mendukung *Server-Side Rendering* (SSR) untuk SEO, *Server Actions* untuk keamanan API, dan integrasi Vercel Cron.
- **Database & Migration:** PostgreSQL + Prisma ORM (Atau Drizzle) - Sangat cocok merepresentasikan tabel berelasi (*Master Data*/Opsi dan *Audit Log*).
- **Authentication:** NextAuth (Auth.js) atau Supabase Auth - Mendukung injeksi data oleh admin dan alur *Magic Link/Forgot Password* untuk first-time users.
- **UI/Styling:** Tailwind CSS + UI/UX Components + Framer Motion. Akan berpatokan pada *glassmorphism*, dark mode as a first class citizen, dengan gaya *premium*.
- **Maps:** `react-simple-maps` dipadukan dengan Data TopoJSON dunia. Tanpa API Key namun dapat dibuat terlihat interaktif.
- **Email Service/Job:** Resend API + Vercel Cron. Digunakan untuk merotasi data alumni di awal tahun dan mengirim pengumuman.

---

## 📊 Data Structure Requirements
Struktur data di bawah ini adalah acuan utama untuk *Master Data* dan form profil alumni (Kategori A, B, C, dan D):

### A. Data Pribadi
- **Email:** String
- **Nama Lengkap:** String
- **Nomor Handphone:** String
- **Status Perkawinan:** *Master Data* (Kawin / Belum Kawin / Cerai Hidup / Cerai Mati)
- **Kewarganegaraan:** String

### B. Data Kealumnian
- **Tahun Masuk:** *Master Data* (Range 2013 - 2030)
- **Tahun Lulus:** *Master Data* (Range 2013 - 2030, & "Tidak Menyelesaikan Studi")
- **Jenjang Pendidikan Tertinggi di Sekolah:** Enum/String (SMP 7, SMP 8, SMP 9, SMA 10, SMA 11, SMA 12)
- **Asal Jenjang Saat Masuk:** *Master Data* (SMP / SMA)
- **Status Kelulusan:** *Master Data* (Lulus SMP / Lulus SMA / Tidak Lulus (Keluar/Pindah))

### C. Domisili Utama
Terbagi berdasarkan Domisili (Dalam Negeri / Luar Negeri):
**C1. Dalam Negeri**
- **Provinsi:** *Master Data*
- **Kota Administrasi/Kabupaten:** *Master Data*

**C2. Luar Negeri**
- **Negara:** *Master Data*
- **Provinsi/State Negara:** *Master Data*

### D. Kegiatan Saat Ini
Status kegiatan: *Kuliah, Bekerja, Kuliah dan Bekerja, Lulus Kuliah dan Bekerja.* Tergantung opsi ini, form pecahannya adalah:

**D1. Kegiatan - Kuliah**
Pilih Domisili Perkuliahan (Dalam Negeri / Luar Negeri):
* **D1-A. Dalam Negeri & D1-B. Luar Negeri:**
  - **Jenjang Pendidikan Tinggi:** *Master Data* (D1 - S3 & Pendidikan Profesional/Sertifikasi/Setara)
  - **Nama Perguruan Tinggi:** String
  - **Program Studi:** *Master Data*
  - **Status Kelulusan:** *Master Data* (Lulus / Sedang Berkuliah)

**D2. Kegiatan - Bekerja**
- **Instansi Tempat Bekerja / Bisnis:** String
- **Status Pekerjaan:** *Master Data*
- **Posisi Pekerjaan:** String

*(Catatan: D3 HANYA Kuliah & Bekerja, dan D4 HANYA Lulus Kuliah & Bekerja adalah gabungan input field dari D1 dan D2)*

---

## 📂 File Structure (Proposed)

```text
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (portal)/        # UI Publik / Portal Alumni
│   │   ├── (admin)/         # Admin Panel (Protected)
│   │   ├── api/             # API Handlers & Cron Jobs
│   ├── components/          # Reusable UI (Cards, Maps, Forms)
│   ├── core/                # Business Logics & Data Fetching
│   ├── lib/                 # Prisma/DB client, Utils, Mailer
│   └── types/               # TypeScript interfaces
├── prisma/                  # DB Schemas (Master Data, Alumni, Logs)
├── public/                  # Assets (TopoJSON map data)
└── PLAN-alumni-connect.md   # Project Plans
```

---

## 📋 Task Breakdown

> **Agent Assignments:**
> - `frontend-specialist`: Mengurus UI premium, Maps, portal.
> - `backend-specialist`: Mengontrol workflow API, Cron Jobs, Email.
> - `database-architect`: Setup skema relasional Master Data.
> - `security-auditor`: Review pipeline auth & payload sanitization.

### Phase 1: Foundation & Data Modeling
| Task ID | Name | Agent (Skill) | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|---------------|----------|--------------|--------------------------|
| **F.1** | Setup Next.js Project | `frontend-specialist` (`app-builder`) | P0 | None | **IN:** Plan file <br> **OUT:** Next.js scaffold + Tailwind <br> **VERIFY:** Dev server berjalan, config *dark mode* ready. |
| **F.2** | DB Schema Formulation | `database-architect` (`database-design`) | P0 | None | **IN:** Rincian tabel Master Data, Profil, & Audit Log <br> **OUT:** `schema.prisma` file <br> **VERIFY:** `prisma format` lolos tanpa error. |
| **F.3** | Auth Framework Setup | `security-auditor` (`api-patterns`) | P0 | F.1, F.2 | **IN:** Alur *inject Email* Admin -> *Reset Pass* <br> **OUT:** NextAuth/Supabase Auth integrasi di `src/lib/auth` <br> **VERIFY:** Bisa proteksi `/admin` routing. |

### Phase 2: Core Workflows (Backend & API)
| Task ID | Name | Agent (Skill) | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|---------------|----------|--------------|--------------------------|
| **C.1** | Admin Master Data CRUD | `backend-specialist` (`clean-code`) | P1 | F.2 | **IN:** Schema master data (Agama, Provinsi, dll) <br> **OUT:** Server actions / API CRUD Master Data <br> **VERIFY:** Opsi bisa ditambah/hapus via API request. |
| **C.2** | Request Data Approval Flow | `backend-specialist` (`api-patterns`) | P1 | F.2, F.3 | **IN:** Alur edit yang butuh verifikasi <br> **OUT:** State 'Waiting for Approval' + Audit Logs <br> **VERIFY:** Alumni tidak bisa re-submit kalau status sedang `WAITING`. |
| **C.3** | Cron Job Email Reminder | `backend-specialist` (`clean-code`) | P2 | None | **IN:** Syarat kirim awal tahun <br> **OUT:** `/api/cron/yearly-remind` endpoint terhubung ke Resend <br> **VERIFY:** *Trigger* cron endpoint menghasilkan response status logik pengiriman. |

### Phase 3: Premium UI & Interfaces (Frontend)
| Task ID | Name | Agent (Skill) | Priority | Dependencies | INPUT → OUTPUT → VERIFY |
|---------|------|---------------|----------|--------------|--------------------------|
| **UX.1**| Design System & Layout | `frontend-specialist` (`frontend-design`) | P1 | F.1 | **IN:** Kebutuhan Premium & Responsive <br> **OUT:** Komponen *Navbar*, *Sidebar*, Input Fields (Framer Motion) <br> **VERIFY:** Desktop & Mobile responsive, *Dark mode switch* berfungsi. |
| **UX.2**| Admin Dashboard Panel | `frontend-specialist` (`frontend-design`) | P1 | C.1, C.2 | **IN:** API Master Data & Approval <br> **OUT:** View log perubahan & tabel approval <br> **VERIFY:** List approval dapat di-approve/reject dan merubah state DB. |
| **UX.3**| Alumni Portal & Forms | `frontend-specialist` (`frontend-design`) | P1 | C.2 | **IN:** Form berlapis berdasarkan Data A,B,C,D <br> **OUT:** View form klaim profil dengan disable-input saat "Waiting" <br> **VERIFY:** Render form berdasarkan opsi Master Data terbaru. |
| **UX.4**| World Map & Metrics Widget | `frontend-specialist` (`frontend-design`) | P2 | F.1 | **IN:** Library `react-simple-maps` <br> **OUT:** Peta interaktif & hitungan populasi <br> **VERIFY:** Pin pada peta tampil mengikuti geolokasi data yg diubah oleh profil alumni. |

---

## ✅ PHASE X: VERIFICATION CHECKLIST (MANDATORY)
Sebelum serah terima aplikasi ke level *Production*, wajib menyelesaikan poin-poin berikut:
- [ ] **Lint & Type Check:** `npm run lint` & `tsc --noEmit` lolos 100%.
- [ ] **Socratic Gate Passed:** Alur *Auth*, *Waiting State*, & *Maps/Email* terkonfirmasi selaras dengan kemauan *Users*.
- [ ] **Security Audits:** Eksekusi script `.agent/skills/vulnerability-scanner/scripts/security_scan.py .` tidak menemukan kerentanan bypass Authorization pada *state* persetujuan.
- [ ] **UX / Styling Rule Compliance:** Tidak ada palet warna bawaan standar/murahan, tidak ada warna ungu (*Purple Ban*), mode Gelap optimal, interaktif dengan layar sentuh (mobile).
- [ ] **Audit Log Functionality Test:** Seluruh pergantian status (misal: "Belum Kawin" -> "Kawin") dikonfirmasi tercatat oleh sistem *Log Tracker* sebagai *Traceability*.
- [ ] **E2E & Lighthouse Tests:** Lolos standar Vitals Performance dan lolos aksesibilitas.

---
*Generated by: @[project-planner]*
