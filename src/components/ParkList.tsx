import type { Park } from '../types/park'
import { ParkListItem } from './ParkListItem'

type ParkListProps = {
  parks: readonly Park[]
  selectedParkId: string | null
  onSelectPark: (id: string) => void
}

export function ParkList({ parks, selectedParkId, onSelectPark }: ParkListProps) {
  return (
    <nav id="park-list" className="park-list" aria-label="Parks">
      <h2 className="park-list__heading">Parks</h2>
      <ul className="park-list__items">
        {parks.map((park) => (
          <ParkListItem
            key={park.id}
            park={park}
            isSelected={park.id === selectedParkId}
            onSelect={onSelectPark}
          />
        ))}
      </ul>
    </nav>
  )
}