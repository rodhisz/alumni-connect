"use server"

/**
 * Server Actions to fetch location data from external APIs
 * This bypasses CORS issues when fetching directly from the client.
 */

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

export async function getProvinces() {
  try {
    const res = await fetch("https://wilayah.id/api/provinces.json", { 
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 } 
    })
    if (!res.ok) throw new Error("Gagal mengambil data provinsi")
    const json = await res.json()
    console.log("getProvinces keys:", Object.keys(json))
    return { success: true, data: json.data || [] }
  } catch (error: any) {
    console.error("getProvinces error:", error)
    return { success: false, error: error.message }
  }
}

export async function getRegencies(provinceCode: string) {
  if (!provinceCode) return { success: true, data: [] }
  try {
    const res = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`, { 
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 } 
    })
    if (!res.ok) throw new Error("Gagal mengambil data kota/kabupaten")
    const json = await res.json()
    return { success: true, data: json.data || [] }
  } catch (error: any) {
    console.error("getRegencies error:", error)
    return { success: false, error: error.message }
  }
}

export async function getCountries() {
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso", { 
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 } 
    })
    if (!res.ok) throw new Error(`Gagal mengambil data negara: ${res.status}`)
    const json = await res.json()
    
    // Map to { id: string, name: string }
    const data = (json.data || []).map((c: any) => ({
      id: c.name, // Use name as ID for easier lookup in state fetch
      name: c.name
    }))

    return { success: true, data }
  } catch (error: any) {
    console.error("getCountries error:", error)
    return { success: false, error: error.message }
  }
}

export async function getStates(countryName: string) {
  if (!countryName) return { success: true, data: [] }
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", { 
      method: "POST",
      headers: { 
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ country: countryName }),
      next: { revalidate: 86400 } 
    })
    
    if (!res.ok) {
        // Fallback for some countries that might fail
        return { success: true, data: [] }
    }
    
    const json = await res.json()
    
    // Response is { data: { states: [{ name, state_code }] } }
    const states = (json.data?.states || []).map((s: any) => ({
      id: s.name,
      name: s.name
    }))

    return { success: true, data: states }
  } catch (error: any) {
    console.error("getStates error:", error)
    return { success: false, error: error.message }
  }
}
