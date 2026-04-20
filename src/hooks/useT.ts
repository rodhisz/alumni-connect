"use client"

/**
 * Re-export for ergonomic use:
 *   import { useT } from "@/hooks/useT"
 *   const t = useT()
 *   t("save") → "Simpan" / "Save"
 */
export { useLanguage as default } from "@/components/Providers"

export function useT() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = require("@/components/Providers").useLanguage()
  return t
}
