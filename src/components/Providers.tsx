"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────
type Language = "id" | "en"

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

// ─────────────────────────────────────
// Translations Dictionary
// ─────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    dashboard: "Dasbor",
    alumni_data: "Data Alumni",
    master_data: "Master Data",
    settings: "Pengaturan",
    logout: "Keluar",
    approvals: "Persetujuan",
    notifications: "Notifikasi",
    mark_all_read: "Tandai semua dibaca",
    no_notifications: "Tidak ada notifikasi baru",
    network_map: "Peta Jaringan",
    user_management: "Manajemen User",
    approval_matrix: "Metriks Persetujuan",
    system_settings: "Pengaturan Sistem",
    personal_data: "Profil Saya",
    news: "Berita & Artikel",
    news_management: "Kelola Berita",
    read_more: "Baca Selengkapnya",
    published: "Terbit",
    unpublished: "Draf",
    latest_news: "Berita Terkini",
    all_news: "Lihat Semua Berita",

    // Status
    waiting_approval: "Menunggu Persetujuan",
    approved: "Disetujui",
    rejected: "Ditolak",
    draft: "Draf",
    all: "Semua",

    // Actions
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
    add: "Tambah",
    search: "Cari",
    create: "Buat Baru",
    back: "Kembali",
    confirm: "Konfirmasi",
    submit: "Kirim",
    approve: "Setujui",
    reject: "Tolak",
    export: "Ekspor",
    import: "Impor",
    download: "Unduh",
    upload: "Unggah",
    preview: "Pratinjau",
    close: "Tutup",
    next: "Selanjutnya",
    previous: "Sebelumnya",
    loading: "Memuat...",
    saving: "Menyimpan...",
    processing: "Memproses...",

    // Labels - Personal
    full_name: "Nama Lengkap",
    email: "Email",
    phone_number: "No. HP / WA",
    citizenship: "Kewarganegaraan",
    marital_status: "Status Perkawinan",
    gender: "Jenis Kelamin",
    birth_date: "Tanggal Lahir",
    username: "Nama Pengguna",
    password: "Kata Sandi",
    role: "Peran",
    status: "Status",

    // Labels - Academic
    start_year: "Tahun Masuk",
    graduation_year: "Tahun Lulus",
    highest_education: "Pendidikan Terakhir",
    entry_level: "Jenjang Masuk",
    graduation_status: "Status Kelulusan",
    academic_data: "Data Kealumnian",

    // Labels - Domicile
    domicile: "Domisili",
    domicile_type: "Jenis Domisili",
    domestic: "Dalam Negeri",
    foreign: "Luar Negeri",
    province: "Provinsi",
    city: "Kota / Kabupaten",
    country: "Negara",
    state: "Wilayah / State",
    address: "Alamat",

    // Labels - Activity
    activity: "Kegiatan Saat Ini",
    activity_status: "Status Kegiatan",
    college: "Kuliah / Studi",
    working: "Bekerja / Berwirausaha",
    college_and_working: "Kuliah & Bekerja",
    graduated_and_working: "Lulus Kuliah & Bekerja",
    college_level: "Jenjang Perkuliahan",
    university: "Universitas",
    major: "Program Studi",
    college_status: "Status Perkuliahan",
    company: "Perusahaan",
    job_position: "Jabatan / Posisi",
    job_status: "Status Kepegawaian",

    // Labels - Other
    other: "Lainnya",
    description: "Deskripsi",
    category: "Kategori",
    module_category: "Kategori Modul",
    order: "Urutan",
    name: "Nama",
    code: "Kode",
    value: "Nilai",
    type: "Tipe",
    notes: "Catatan",
    active: "Aktif",
    inactive: "Nonaktif",
    actions: "Aksi",

    // Messages
    no_data: "Tidak ada data",
    data_saved: "Data berhasil disimpan",
    data_deleted: "Data berhasil dihapus",
    confirm_delete: "Apakah Anda yakin ingin menghapus data ini?",
    confirm_action: "Apakah Anda yakin?",
    error_occurred: "Terjadi kesalahan",
    required_field: "Wajib diisi",
    unauthorized: "Tidak memiliki akses",
    session_expired: "Sesi telah berakhir",
    success: "Berhasil",
    failed: "Gagal",
    warning: "Peringatan",
    info: "Informasi",

    // Dashboard
    total_alumni: "Total Alumni",
    pending_approvals: "Menunggu Persetujuan",
    approved_data: "Data Disetujui",
    registered_today: "Terdaftar Hari Ini",
    recent_activity: "Aktivitas Terkini",
    quick_stats: "Statistik Cepat",
    domestic_count: "Alumni di Indonesia",
    locations_reached: "Lokasi Terjangkau",

    // Home Page
    explore_now: "Mulai Eksplorasi",
    hero_title: "Direktori Alumni.",
    hero_subtitle_gradient: "Jaringan Tanpa Batas.",
    hero_description: "Temukan rekan sejawat dan pantau persebaran alumni kita di seluruh penjuru dunia. Informasi terkini tentang prestasi dan kegiatan alumni dalam satu platform.",
    verified_system: "Verifikasi Berlapis",
    alumni_activity: "Kegiatan Alumni",
    secure_100: "100% Aman",
    college_work: "Kuliah & Bekerja",
    global_distribution: "Persebaran Global",
    interactive_map: "Peta Interaktif",
    alumni_registered: "Komunitas Global",
    manage_data_abcd: "Mengelola Data A, B, C, D",

    // User Management
    identity: "Identitas",
    role_system: "Role Sistem",
    reg_date: "Tgl Daftar",
    security_management: "Manajemen Keamanan",
    reset_password: "Reset Password",
    new_password: "Password Baru",
    force_change: "Paksa Ubah",
    change_access: "Ubah Hak Akses",
    change_password: "Ganti Password",
    no_user_found: "Tidak ada user ditemukan",
    superuser_desc: "Akses penuh sistem & manajemen user",
    admin_desc: "Kelola alumni & data, tanpa setting sistem",
    alumni_desc: "Akses terbatas ke dashboard & profil pribadi",

    // Alumni List
    alumni_list: "Daftar Alumni",
    add_alumni: "Tambah Alumni",
    create_alumni: "Buat Data Alumni",
    edit_alumni: "Edit Data Alumni",
    detail_alumni: "Detail Alumni",
    no_alumni: "Belum ada data alumni",
    search_alumni: "Cari alumni...",

    // Approval
    revision_request: "Permintaan Revisi",
    approval_history: "Riwayat Persetujuan",
    review_request: "Tinjau Permintaan",
    changes_requested: "Perubahan Diminta",
    alumni_approvals: "Daftar Persetujuan",

    // Form sections
    section_personal: "A. Data Pribadi",
    section_academic: "B. Data Kealumnian",
    section_domicile: "C. Domisili Saat Ini",
    section_activity: "D. Kegiatan Saat Ini",
    
    // WNI / WNA
    wni: "WNI (Warga Negara Indonesia)",
    wna: "WNA (Warga Negara Asing)",

    // Portal
    my_profile: "Profil Saya",
    edit_profile: "Ubah Profil",
    data_pending_notice: "Data Anda sedang menunggu persetujuan admin.",
    profile_not_complete: "Profil belum lengkap",
    
    // Master Data
    manage_master_data: "Kelola Master Data",
    all_categories: "Semua Kategori",
    add_item: "Tambah Item",
    template_download: "Unduh Template",
    bulk_import: "Impor Massal",
    drag_to_reorder: "Seret untuk mengubah urutan",
    account_activation: "Aktivasi Akun",
    activation_step1_desc: "Masukkan email untuk memverifikasi data alumni Anda.",
    activation_step2_desc: "Halo {name}, silakan buat kata sandi baru.",
    activation_success_title: "Aktivasi Berhasil!",
    activation_success_desc: "Akun Anda sekarang telah dikonfigurasi. Silakan masuk menggunakan kata sandi yang baru saja Anda buat.",
    email_invitation_label: "Alamat Email (Sesuai Undangan)",
    checking_database: "Mengecek Database...",
    continue: "Lanjutkan",
    only_invited_email_notice: "Hanya email yang telah didaftarkan oleh Admin yang dapat melakukan aktivasi.",
    change_email: "Ganti Email",
    create_password_label: "Buat Kata Sandi Baru",
    finish_activation: "Selesaikan Aktivasi",
    go_to_login: "Menuju Halaman Login",
    err_email_not_found: "Email tidak ditemukan di sistem. Harap hubungi Admin.",
    err_already_activated: "Akun ini sudah pernah diaktivasi. Silakan langsung Log In.",
    err_activation_failed: "Gagal melakukan aktivasi, harap coba sesaat lagi.",
  },

  en: {
    // Navigation
    dashboard: "Dashboard",
    alumni_data: "Alumni Data",
    master_data: "Master Data",
    settings: "Settings",
    logout: "Logout",
    approvals: "Approvals",
    notifications: "Notifications",
    mark_all_read: "Mark all as read",
    no_notifications: "No new notifications",
    network_map: "Network Map",
    user_management: "User Management",
    approval_matrix: "Approval Matrix",
    system_settings: "System Settings",
    personal_data: "My Profile",
    news: "News & Articles",
    news_management: "Manage News",
    read_more: "Read More",
    published: "Published",
    unpublished: "Draft",
    latest_news: "Latest News",
    all_news: "View All News",

    // Status
    waiting_approval: "Waiting Approval",
    approved: "Approved",
    rejected: "Rejected",
    draft: "Draft",
    all: "All",

    // Actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    search: "Search",
    create: "Create New",
    back: "Back",
    confirm: "Confirm",
    submit: "Submit",
    approve: "Approve",
    reject: "Reject",
    export: "Export",
    import: "Import",
    download: "Download",
    upload: "Upload",
    preview: "Preview",
    close: "Close",
    next: "Next",
    previous: "Previous",
    loading: "Loading...",
    saving: "Saving...",
    processing: "Processing...",

    // Labels - Personal
    full_name: "Full Name",
    email: "Email",
    phone_number: "Phone / WhatsApp",
    citizenship: "Citizenship",
    marital_status: "Marital Status",
    gender: "Gender",
    birth_date: "Date of Birth",
    username: "Username",
    password: "Password",
    role: "Role",
    status: "Status",

    // Labels - Academic
    start_year: "Enrollment Year",
    graduation_year: "Graduation Year",
    highest_education: "Highest Education",
    entry_level: "Entry Level",
    graduation_status: "Graduation Status",
    academic_data: "Academic Data",

    // Labels - Domicile
    domicile: "Domicile",
    domicile_type: "Domicile Type",
    domestic: "Domestic",
    foreign: "International",
    province: "Province",
    city: "City / District",
    country: "Country",
    state: "State / Region",
    address: "Address",

    // Labels - Activity
    activity: "Current Activity",
    activity_status: "Activity Status",
    college: "College / Study",
    working: "Working / Entrepreneur",
    college_and_working: "Studying & Working",
    graduated_and_working: "Graduated & Working",
    college_level: "College Level",
    university: "University",
    major: "Study Program",
    college_status: "College Status",
    company: "Company",
    job_position: "Job Position",
    job_status: "Employment Status",

    // Labels - Other
    other: "Other",
    description: "Description",
    category: "Category",
    module_category: "Module Category",
    order: "Order",
    name: "Name",
    code: "Code",
    value: "Value",
    type: "Type",
    notes: "Notes",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",

    // Messages
    no_data: "No data found",
    data_saved: "Data saved successfully",
    data_deleted: "Data deleted successfully",
    confirm_delete: "Are you sure you want to delete this data?",
    confirm_action: "Are you sure?",
    error_occurred: "An error occurred",
    required_field: "Required",
    unauthorized: "Unauthorized",
    session_expired: "Session expired",
    success: "Success",
    failed: "Failed",
    warning: "Warning",
    info: "Information",

    // Dashboard
    total_alumni: "Total Alumni",
    pending_approvals: "Pending Approvals",
    approved_data: "Approved Data",
    registered_today: "Registered Today",
    recent_activity: "Recent Activity",
    quick_stats: "Quick Stats",
    domestic_count: "Alumni in Indonesia",
    locations_reached: "Locations Reached",

    // Home Page
    explore_now: "Start Exploring",
    hero_title: "Alumni Directory.",
    hero_subtitle_gradient: "Limitless Network.",
    hero_description: "Discover fellow alumni and track our global presence across the world. Stay updated with the latest alumni achievements and activities in one place.",
    verified_system: "Multi-layered Verification",
    alumni_activity: "Alumni Activity",
    secure_100: "100% Secure",
    college_work: "Study & Work",
    global_distribution: "Global Distribution",
    interactive_map: "Interactive Map",
    alumni_registered: "Global Community Alumni",
    manage_data_abcd: "Managing Data A, B, C, D",

    // User Management
    identity: "Identity",
    role_system: "System Role",
    reg_date: "Registration Date",
    security_management: "Security Management",
    reset_password: "Reset Password",
    new_password: "New Password",
    force_change: "Force Change",
    change_access: "Change Access Rights",
    change_password: "Change Password",
    no_user_found: "No users found",
    superuser_desc: "Full system access & user management",
    admin_desc: "Manage alumni & data, no system settings",
    alumni_desc: "Limited access to dashboard & personal profile",

    // Alumni List
    alumni_list: "Alumni List",
    add_alumni: "Add Alumni",
    create_alumni: "Create Alumni",
    edit_alumni: "Edit Alumni",
    detail_alumni: "Alumni Detail",
    no_alumni: "No alumni data yet",
    search_alumni: "Search alumni...",

    // Approval
    revision_request: "Revision Request",
    approval_history: "Approval History",
    review_request: "Review Request",
    changes_requested: "Changes Requested",
    alumni_approvals: "Alumni Approvals",

    // Form sections
    section_personal: "A. Personal Data",
    section_academic: "B. Academic Data",
    section_domicile: "C. Current Domicile",
    section_activity: "D. Current Activity",

    // WNI / WNA
    wni: "Indonesian Citizen (WNI)",
    wna: "Foreign Citizen (WNA)",

    // Portal
    my_profile: "My Profile",
    edit_profile: "Edit Profile",
    data_pending_notice: "Your data is awaiting admin approval.",
    profile_not_complete: "Profile incomplete",

    // Master Data
    manage_master_data: "Manage Master Data",
    all_categories: "All Categories",
    add_item: "Add Item",
    template_download: "Download Template",
    bulk_import: "Bulk Import",
    drag_to_reorder: "Drag to reorder",
    account_activation: "Account Activation",
    activation_step1_desc: "Enter your email to verify your alumni data.",
    activation_step2_desc: "Hi {name}, please create a new password.",
    activation_success_title: "Activation Successful!",
    activation_success_desc: "Your account is now configured. Please log in using the password you just created.",
    email_invitation_label: "Email Address (As Invited)",
    checking_database: "Checking Database...",
    continue: "Continue",
    only_invited_email_notice: "Only emails registered by the Admin can perform activation.",
    change_email: "Change Email",
    create_password_label: "Create New Password",
    finish_activation: "Complete Activation",
    go_to_login: "Go to Login Page",
    err_email_not_found: "Email not found in the system. Please contact Admin.",
    err_already_activated: "This account has already been activated. Please log in directly.",
    err_activation_failed: "Failed to activate account, please try again momentarily.",
  },
}

// ─────────────────────────────────────
// Language Context
// ─────────────────────────────────────
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("id")

  useEffect(() => {
    const saved = localStorage.getItem("alumni-lang") as Language
    if (saved === "id" || saved === "en") setLangState(saved)
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem("alumni-lang", newLang)
  }

  const t = (key: string): string => {
    return translations[lang][key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}

// ─────────────────────────────────────
// Root Providers
// ─────────────────────────────────────
// ─────────────────────────────────────
// Theme Provider (Manual Implementation for React 19 compatibility)
// ─────────────────────────────────────
type Theme = "light" | "dark"
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ManualThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("alumni-theme") as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("alumni-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ManualThemeProvider")
  return context
}

// ─────────────────────────────────────
// Root Providers
// ─────────────────────────────────────
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ManualThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ManualThemeProvider>
  )
}
