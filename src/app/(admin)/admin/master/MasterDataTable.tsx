"use client"

import { useState } from "react"
import { Plus, Search, Trash2, Power, AlertCircle, GripVertical } from "lucide-react"
import { Reorder, useDragControls } from "framer-motion"
import { addMasterData, toggleMasterDataStatus, deleteMasterData, updateMasterDataOrder } from "@/core/actions/master-data"
import type { Category } from "@prisma/client"
import { useConfirm } from "@/components/ConfirmProvider"
import { FileSpreadsheet } from "lucide-react"
import ExcelImportModal from "@/components/ExcelImportModal"
import { importMasterDataBulk } from "@/core/actions/import"
import { useLanguage } from "@/components/Providers"

type MasterDataItem = {
  id: string
  category: string
  name: string
  description: string | null
  isActive: boolean
  order: number
}

type CategoryOption = {
  value: string
  label: string
}

export default function MasterDataTable({ 
  initialData, 
  categories 
}: { 
  initialData: MasterDataItem[], 
  categories: CategoryOption[] 
}) {
  const [data, setData] = useState(initialData)
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  const [search, setSearch] = useState("")
  const { confirm } = useConfirm()
  const { t, lang } = useLanguage()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Add Form State
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newOrder, setNewOrder] = useState(0)
  const [newCat, setNewCat] = useState<Category | "">(categories[0].value as Category)

  // Smart Category Selection for Modal
  const openAddModal = () => {
    if (activeCategory !== "ALL") {
      setNewCat(activeCategory as Category)
    } else {
      setNewCat(categories[0].value as Category)
    }
    setShowAddModal(true)
  }

  const filteredData = data.filter(item => 
    (activeCategory === "ALL" || item.category === activeCategory) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  // Reorder Handler
  const handleReorder = async (newData: MasterDataItem[]) => {
    // Only allow reorder within a specific category (not in ALL view)
    if (activeCategory === "ALL") return;

    // We only update the order for items in the current category
    const updatedWithOrder = newData.map((item, index) => ({
      ...item,
      order: index
    }))

    // Update local state first for instant feedback
    // Merge back with the items from other categories if needed
    const otherData = data.filter(d => d.category !== activeCategory)
    setData([...otherData, ...updatedWithOrder].sort((a,b) => a.order - b.order))

    // Send to server (we need a batch update action)
    await updateMasterDataOrder(updatedWithOrder.map(item => ({ id: item.id, order: item.order })))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCat) return
    setLoading(true)
    setErrorMsg("")
    
    const res = await addMasterData({ 
      category: newCat as Category, 
      name: newName, 
      description: newDesc, 
      order: Number(newOrder) 
    })
    
    if (res.success && res.data) {
      setData([...data, res.data as MasterDataItem].sort((a,b) => a.order - b.order))
      setShowAddModal(false)
      setNewName("")
      setNewDesc("")
      setNewOrder(0)
    } else {
      setErrorMsg(res.error || "Gagal menyimpan")
    }
    setLoading(false)
  }

  const handleToggleStatus = async (item: MasterDataItem) => {
    const res = await toggleMasterDataStatus(item.id, item.isActive)
    if (res.success) {
      setData(data.map(d => d.id === item.id ? { ...d, isActive: !item.isActive } : d))
    } else {
      alert(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    confirm({
      title: lang === "id" ? "Hapus Opsi Master?" : "Delete Master Option?",
      message: lang === "id" 
        ? "Data ini akan dihapus secara permanen dari sistem." 
        : "This data will be permanently deleted from the system.",
      confirmText: lang === "id" ? "Hapus Permanen" : "Delete Permanently",
      type: "danger",
      onConfirm: async () => {
        const res = await deleteMasterData(id)
        if (res.success) {
          setData(data.filter(d => d.id !== id))
        } else {
          alert(res.error)
        }
      }
    })
  }

  return (
    <>
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Category Sidebar/Nav */}
      <div className="w-1/3 max-w-sm hidden md:flex flex-col gap-2 overflow-y-auto pr-4 custom-scrollbar">
        <button 
          onClick={() => setActiveCategory("ALL")}
          className={`text-left px-5 py-3 rounded-xl transition-all font-medium text-sm border ${
            activeCategory === "ALL" ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm" : "border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
          }`}
        >
          {lang === "id" ? "Semua Kategori" : "All Categories"}
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`text-left px-5 py-3 rounded-xl transition-all font-medium text-sm border ${
              activeCategory === cat.value ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm" : "border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="flex-1 glass rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/50 dark:bg-black/20">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder={lang === "id" ? "Cari item..." : "Search items..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <FileSpreadsheet size={18} />
              {lang === "id" ? "Import Excel" : "Import Excel"}
            </button>
            <button 
              onClick={openAddModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              {lang === "id" ? "Tambah Data" : "Add Data"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white/30 dark:bg-black/10">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-700">
              <tr className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">{lang === "id" ? "Nama Opsi" : "Option Name"}</th>
                <th className="p-4 font-medium">{t("description")}</th>
                <th className="p-4 font-medium hidden lg:table-cell">{t("category")}</th>
                <th className="p-4 font-medium text-center">{t("status")}</th>
                <th className="p-4 font-medium text-right">{t("actions")}</th>
              </tr>
            </thead>
            <Reorder.Group 
              axis="y" 
              values={filteredData} 
              onReorder={handleReorder}
              className="divide-y divide-zinc-200 dark:divide-zinc-800"
              as="tbody"
            >
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    {lang === "id" ? "Belum ada data di kategori ini." : "No data in this category yet."}
                  </td>
                </tr>
              ) : filteredData.map(item => (
                <Reorder.Item 
                  key={item.id} 
                  value={item} 
                  as="tr"
                  dragListener={activeCategory !== "ALL"}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-default"
                >
                  <td className="p-4 font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    {activeCategory !== "ALL" && (
                      <GripVertical size={16} className="text-zinc-300 cursor-grab active:cursor-grabbing" />
                    )}
                    {item.name}
                  </td>
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{item.description || "-"}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-xs">
                      {categories.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(item)}
                      title={item.isActive ? (lang === "id" ? "Nonaktifkan" : "Deactivate") : (lang === "id" ? "Aktifkan" : "Activate")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      item.isActive ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" : "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}>
                      <Power size={12} />
                      {item.isActive ? t("active") : t("inactive")}
                    </button>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6">
              <h3 className="text-xl font-bold font-outfit text-zinc-900 dark:text-white">
                {lang === "id" ? "Tambah Opsi Baru" : "Add New Option"}
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {lang === "id" 
                  ? "Data ini akan muncul sebagai opsi pada form isian alumni." 
                  : "This data will appear as an option on the alumni input form."}
              </p>
              
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdd} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">{t("module_category")}</label>
                  <select 
                    required
                    disabled={activeCategory !== "ALL"}
                    value={newCat}
                    onChange={e => setNewCat(e.target.value as Category)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
                  >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Label Opsi</label>
                  <input 
                    required
                    type="text" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    placeholder={lang === "id" ? "Contoh: Jawa Timur" : "Example: West Java"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                    {lang === "id" ? "Deskripsi Tambahan (Opsional)" : "Additional Description (Optional)"}
                  </label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    placeholder={lang === "id" ? "Membantu jika terdapat label kembar" : "Helpful if there are duplicate labels"}
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors">
                    {t("cancel")}
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50">
                    {loading ? t("saving") : t("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={lang === "id" ? "Import Master Data" : "Import Master Data"}
        templateFilename="alumni_connect_master"
        templateHeaders={["Category", "Name", "Description", "Order"]}
        templateExampleRows={categories.map(cat => [cat.label, "Contoh Nama Opsi", "Deskripsi...", 0])}
        onImport={importMasterDataBulk}
      />
    </>
  )
}
