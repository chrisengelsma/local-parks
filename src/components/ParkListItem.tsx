import type { Park } from '../types/park'
import {
  formatAcreage,
  formatRating,
  isDisplayableAcreage,
  isDisplayableRating,
} from '../lib/parkDisplay'
import { parkHasMapLocation } from '../lib/parkGeo'

type ParkListItemProps = {
  park: Park
  isSelected: boolean
  onSelect: (id: string) => void
}

export function ParkListItem({ park, isSelected, onSelect }: ParkListItemProps) {
  return (
    <li>
      <button
        type="button"
        className="park-list__button"
        aria-current={isSelected ? 'page' : undefined}
        onClick={() => onSelect(park.id)}
      >
        <span className="park-list__name">{park.name}</span>
        <span className="park-list__meta">
          {isDisplayableRating(park.rating) && (
            <span className="park-list__rating">{formatRating(park.rating)} ★</span>
          )}
          {isDisplayableAcreage(park.acreage) && (
            <span className="park-list__acreage">{formatAcreage(park.acreage)}</span>
          )}
          {!parkHasMapLocation(park) && (
            <span className="park-list__off-map">Not shown on map</span>
          )}
        </span>
      </button>
    </li>
  )
}