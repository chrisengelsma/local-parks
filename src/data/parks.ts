import parksJson from '../../assets/parks.sample.json'
import type { Park } from '../types/park'
import { sortParksByName } from '../lib/parkDisplay'
import { normalizeParkList } from '../lib/normalizePark'

const loadedParks = normalizeParkList(parksJson)

/** Read-only park list from supplied JSON; never mutated after load. */
export const parks: readonly Park[] = Object.freeze(sortParksByName(loadedParks))

export function findParkById(
  parksList: readonly Park[],
  id: string | null,
): Park | undefined {
  if (id === null) return undefined
  return parksList.find((park) => park.id === id)
}