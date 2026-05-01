"use server"

import prisma from "@/lib/prisma"
import { Category } from "@prisma/client"

/**
 * Server Actions to fetch location data from local MasterData
 * This ensures IDs match the database records for relations.
 */

export async function getProvinces() {
  try {
    const data = await prisma.masterData.findMany({
      where: { category: Category.PROVINCE, isActive: true },
      orderBy: { name: 'asc' }
    })
    return { 
      success: true, 
      data: data.map(d => ({ code: d.id, name: d.name })) 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getRegencies(provinceId: string) {
  if (!provinceId) return { success: true, data: [] }
  try {
    // Look up province name first to filter cities
    const province = await prisma.masterData.findUnique({ where: { id: provinceId } })
    if (!province) return { success: true, data: [] }

    const data = await prisma.masterData.findMany({
      where: { 
        category: Category.CITY, 
        description: province.name, // Cities are linked via province name in description
        isActive: true 
      },
      orderBy: { name: 'asc' }
    })
    return { 
      success: true, 
      data: data.map(d => ({ code: d.id, name: d.name })) 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCountries() {
  try {
    const data = await prisma.masterData.findMany({
      where: { category: Category.COUNTRY, isActive: true },
      orderBy: { name: 'asc' }
    })
    return { 
      success: true, 
      data: data.map(d => ({ id: d.id, name: d.name })) 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStates(countryId: string) {
  if (!countryId) return { success: true, data: [] }
  try {
    const country = await prisma.masterData.findUnique({ where: { id: countryId } })
    if (!country) return { success: true, data: [] }

    const data = await prisma.masterData.findMany({
      where: { 
        category: Category.STATE, 
        description: country.name, // States are linked via country name
        isActive: true 
      },
      orderBy: { name: 'asc' }
    })
    return { 
      success: true, 
      data: data.map(d => ({ id: d.id, name: d.name })) 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
