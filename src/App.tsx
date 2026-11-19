import { useMemo, useState } from 'react'
import { findParkById, parks } from './data/parks'
import { SkipLink } from './components/SkipLink'
import { ParkList } from './components/ParkList'
import { ParkDetails } from './components/ParkDetails'
import { ParkMap } from './components/ParkMap'

export default function App() {
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null)

  const selectedPark = useMemo(
    () => findParkById(parks, selectedParkId),
    [selectedParkId],
  )

  return (
    <>
      <SkipLink />
      <header className="app-header">
        <h1 className="app-header__title">Find a Park</h1>
        <p className="app-header__tagline">
          Browse local parks and view details without sharing your location.
        </p>
      </header>
      <main id="main" className="app-main">
        <div className="app-layout">
          <ParkMap
            parks={parks}
            selectedParkId={selectedParkId}
            onSelectPark={setSelectedParkId}
          />
          <aside className="app-layout__sidebar">
            <ParkList
              parks={parks}
              selectedParkId={selectedParkId}
              onSelectPark={setSelectedParkId}
            />
          </aside>
          <div
            id="park-details-region"
            className="app-layout__content"
            aria-live="polite"
            aria-atomic="false"
          >
            <ParkDetails park={selectedPark} />
          </div>
        </div>
      </main>
    </>
  )
}