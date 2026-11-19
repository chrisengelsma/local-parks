import type { Park } from '../types/park'

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export function parkHasMapLocation(park: Park): boolean {
  const location = park.location
  if (!location) return false
  const { lat, lng } = location
  return isValidCoordinate(lat, lng)
}

export function getParksWithMapLocation(parks: readonly Park[]): Park[] {
  return parks.filter(parkHasMapLocation)
}

export function parkMapPosition(park: Park): [number, number] {
  const location = park.location
  const lat = location?.lat ?? Number.NaN
  const lng = location?.lng ?? Number.NaN
  return [lat, lng]
}