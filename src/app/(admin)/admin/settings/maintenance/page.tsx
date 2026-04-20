import { AlertTriangle } from "lucide-react"
import MaintenancePanel from "./MaintenancePanel"

export const dynamic = "force-dynamic"

export default function MaintenancePage() {
  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <AlertTriangle size={32} className="text-red-500" /> System Maintenance
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Utilitas manajemen basis data dan pembersihan sistem.
          </p>
        </div>

        <MaintenancePanel />
      </div>
    </div>
  )
}
