"use client"

import { useState, useRef } from "react"
import { Upload, X, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { downloadExcelTemplate, parseExcelFile } from "@/lib/excel"
import { useLanguage } from "./Providers"

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  templateFilename: string
  templateHeaders: string[]
  templateExampleRows?: any[][]
  onImport: (data: any[], dryRun?: boolean) => Promise<{ 
    success: boolean; 
    count?: number; 
    created?: number; 
    skipped?: number; 
    error?: string; 
    dryRun?: boolean; 
    results?: { name: string; error?: string; message?: string; type: 'SUCCESS' | 'WARNING' | 'ERROR' }[] 
  }>
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  title,
  templateFilename,
  templateHeaders,
  templateExampleRows,
  onImport
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [testResults, setTestResults] = useState<{ name: string; error?: string; message?: string; type: 'SUCCESS' | 'WARNING' | 'ERROR' }[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, lang } = useLanguage()

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus(null)
      setTestResults(null)
    }
  }

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(templateFilename, templateHeaders, templateExampleRows)
  }

  const handleAction = async (dryRun: boolean = false) => {
    if (!file) return
    setLoading(true)
    setStatus(null)
    if (!dryRun) setTestResults(null)

    try {
      const data = await parseExcelFile(file)
      if (data.length === 0) {
        setStatus({ 
          type: 'error', 
          message: lang === "id" ? 'File Excel kosong atau tidak terbaca.' : 'Excel file is empty or unreadable.'
        })
        setLoading(false)
        return
      }

      const cleanData = JSON.parse(JSON.stringify(data))
      const res = await onImport(cleanData, dryRun)
      
      if (res.success) {
        if (res.dryRun && res.results) {
          setTestResults(res.results)
          const errorCount = res.results.filter(r => r.type === 'ERROR').length
          const warningCount = res.results.filter(r => r.type === 'WARNING').length
          
          if (errorCount > 0) {
            setStatus({ type: 'error', message: lang === 'id' ? `Ditemukan ${errorCount} kesalahan validasi.` : `Found ${errorCount} validation errors.` })
          } else if (warningCount > 0) {
            setStatus({ type: 'success', message: lang === 'id' ? `Validasi selesai dengan ${warningCount} peringatan.` : `Validation complete with ${warningCount} warnings.` })
          } else {
            setStatus({ type: 'success', message: lang === 'id' ? 'Semua data valid!' : 'All data is valid!' })
          }
        } else {
          const msg = res.count 
            ? (lang === "id" ? `Berhasil mengimpor ${res.count} data.` : `Successfully imported ${res.count} items.`)
            : (lang === "id" 
                ? `Berhasil: ${res.created} dibuat, ${res.skipped} dilewati.` 
                : `Success: ${res.created} created, ${res.skipped} skipped.`);
          setStatus({ type: 'success', message: msg })
          setFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
        }
      } else {
        setStatus({ 
          type: 'error', 
          message: res.error || (lang === "id" ? 'Terjadi kesalahan saat mengeksekusi.' : 'An error occurred during execution.') 
        })
      }
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: lang === "id" ? 'Format file tidak didukung atau rusak.' : 'File format not supported or corrupted.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-outfit font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-500" /> {title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex gap-3 text-sm text-blue-700 dark:text-blue-300">
            <AlertCircle className="shrink-0" size={18} />
            <div>
              <p className="font-semibold">{lang === "id" ? "Petunjuk Import:" : "Import Instructions:"}</p>
              <ul className="list-disc ml-4 mt-1 opacity-80 space-y-1">
                <li>{lang === "id" ? "Gunakan template Excel yang disediakan." : "Use the provided Excel template."}</li>
                <li>{lang === "id" ? "Jangan mengubah nama header kolom." : "Do not change column header names."}</li>
                <li>{lang === "id" ? "Hanya sheet pertama yang akan diproses." : "Only the first sheet will be processed."}</li>
              </ul>
            </div>
          </div>

          {/* Download Template */}
          <button 
            onClick={handleDownloadTemplate}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium"
          >
            <Download size={18} /> {lang === "id" ? "Download Template Excel" : "Download Excel Template"}
          </button>

          {/* File Input */}
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={loading}
            />
            <div className={`w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${
              file 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400'
            }`}>
              <div className={`p-4 rounded-2xl ${file ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                <Upload size={32} />
              </div>
              {file ? (
                <div className="text-center">
                  <p className="font-bold text-blue-600 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-zinc-400 font-medium capitalize">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <p className="text-zinc-500 font-medium">{lang === "id" ? "Pilih file Excel anda" : "Select your Excel file"}</p>
              )}
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-2 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium leading-tight">{status.message}</p>
            </div>
          )}

          {/* Test Results Table */}
          {testResults && (
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-300">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="p-2 font-semibold">Data</th>
                    <th className="p-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {testResults.map((res, i) => (
                    <tr key={i} className="bg-white dark:bg-zinc-900/50">
                      <td className="p-2 font-medium truncate max-w-[150px]">{res.name}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        {res.type === 'ERROR' ? (
                          <span className="text-red-500 font-bold">{res.error}</span>
                        ) : res.type === 'WARNING' ? (
                          <span className="text-amber-500 font-bold">{res.message}</span>
                        ) : (
                          <span className="text-emerald-500 font-bold">{res.message}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              {t("close")}
            </button>
            <button 
              onClick={() => handleAction(true)}
              disabled={!file || loading}
              className="flex-1 py-3 px-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (lang === "id" ? "Cek Data" : "Test Data")}
            </button>
          </div>
          <button 
            onClick={() => handleAction(false)}
            disabled={!file || loading || (testResults?.some(r => r.type === 'ERROR') ?? false)}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={18} />}
            {loading ? t("processing") : (lang === "id" ? "Mulai Import Data" : "Start Data Import")}
          </button>
        </div>
      </div>
    </div>
  )
}
