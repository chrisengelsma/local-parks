import type { Park } from '../types/park'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return parsed
  }
  return Number.NaN
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function toDescription(value: unknown): string | null {
  if (value === null) return null
  if (typeof value === 'string') return value
  return null
}

function toRating(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const num = toFiniteNumber(value)
  return Number.isFinite(num) ? num : null
}

function toAcreage(value: unknown): number | null {
  const num = toFiniteNumber(value)
  return Number.isFinite(num) ? num : null
}

/**
 * Coerce one JSON record into a Park safe for UI, or reject records we cannot list.
 * Does not invent municipal content; structural defaults only (e.g. empty arrays).
 */
export function normalizeParkRecord(raw: unknown): Park | null {
  if (!isRecord(raw)) return null

  const id = typeof raw.id === 'string' ? raw.id.trim() : ''
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  if (id === '' || name === '') return null

  const locationRaw = isRecord(raw.location) ? raw.location : {}
  const lat = toFiniteNumber(locationRaw.lat)
  const lng = toFiniteNumber(locationRaw.lng)
  const address =
    typeof locationRaw.address === 'string' ? locationRaw.address : undefined

  const hours = typeof raw.hours === 'string' ? raw.hours : ''

  const acreage = toAcreage(raw.acreage)

  return {
    id,
    name,
    description: toDescription(raw.description),
    location: { lat, lng, address },
    amenities: toStringArray(raw.amenities),
    hours,
    images: toStringArray(raw.images),
    acreage,
    rating: toRating(raw.rating),
  }
}

export function normalizeParkList(raw: unknown): Park[] {
  if (!Array.isArray(raw)) return []

  const parks: Park[] = []
  const seenIds = new Set<string>()

  for (const item of raw) {
    const park = normalizeParkRecord(item)
    if (!park) continue
    if (seenIds.has(park.id)) continue
    seenIds.add(park.id)
    parks.push(park)
  }

  return parks
}