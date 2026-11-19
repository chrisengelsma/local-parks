import type { Park } from '../types/park'

const UNAVAILABLE_DESCRIPTION = 'Description not available.'
const ADDRESS_NOT_LISTED = 'Address not listed'
const NO_AMENITIES = 'No amenities listed'
const HOURS_NOT_LISTED = 'Hours not listed'
const SIZE_NOT_LISTED = 'Size not listed'

export function formatAmenity(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getDisplayDescription(park: Park): string {
  const text = park.description?.trim()
  return text ? text : UNAVAILABLE_DESCRIPTION
}

export function isDescriptionMissing(park: Park): boolean {
  return !park.description?.trim()
}

export function getDisplayAddress(park: Park): string {
  const address = park.location?.address?.trim()
  return address ? address : ADDRESS_NOT_LISTED
}

export function hasDisplayAddress(park: Park): boolean {
  return Boolean(park.location?.address?.trim())
}

function getAmenitiesList(park: Park): string[] {
  return Array.isArray(park.amenities) ? park.amenities : []
}

export function getAmenitiesForDisplay(park: Park): string[] {
  return getAmenitiesList(park)
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0)
    .map(formatAmenity)
}

export function hasAmenities(park: Park): boolean {
  return getAmenitiesForDisplay(park).length > 0
}

export function getAmenitiesFallback(): string {
  return NO_AMENITIES
}

export function isDisplayableRating(rating: number | null): rating is number {
  return rating !== null && Number.isFinite(rating)
}

export function formatRating(rating: number): string {
  if (!Number.isFinite(rating)) return ''
  return rating.toFixed(1)
}

export function isDisplayableAcreage(acreage: number | null): acreage is number {
  return acreage !== null && Number.isFinite(acreage)
}

export function formatAcreage(acreage: number | null): string {
  if (acreage === null || !Number.isFinite(acreage)) return SIZE_NOT_LISTED
  return `${acreage} ${acreage === 1 ? 'acre' : 'acres'}`
}

export function getDisplayHours(park: Park): string {
  const hours = typeof park.hours === 'string' ? park.hours.trim() : ''
  return hours.length > 0 ? hours : HOURS_NOT_LISTED
}

export function isHoursMissing(park: Park): boolean {
  const hours = typeof park.hours === 'string' ? park.hours.trim() : ''
  return hours.length === 0
}

export function getImageUrls(park: Park): string[] {
  const images = Array.isArray(park.images) ? park.images : []
  return images.filter((url) => typeof url === 'string' && url.trim().length > 0)
}

export function hasImages(park: Park): boolean {
  return getImageUrls(park).length > 0
}

export function sortParksByName(parks: readonly Park[]): Park[] {
  return [...parks].sort((a, b) => {
    const nameA = typeof a.name === 'string' ? a.name : ''
    const nameB = typeof b.name === 'string' ? b.name : ''
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' })
  })
}