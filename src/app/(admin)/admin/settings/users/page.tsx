import { getAllUsers } from "@/core/actions/users"
import UserManagementTable from "./UserManagementTable"
import UserManagementHeaderClient from "./UserManagementHeaderClient"

export const dynamic = "force-dynamic"

export default async function UserManagementPage() {
  const result = await getAllUsers(1, 10)

  return (
    <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <UserManagementHeaderClient />
        {result.error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">Error: {result.error}</div>
        ) : (
          <UserManagementTable initialResponse={result} />
        )}
      </div>
    </div>
  )
}
