import { useEffect, useId, useMemo, useRef } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { Park } from '../types/park'
import {
  getParksWithMapLocation,
  parkHasMapLocation,
  parkMapPosition,
} from '../lib/parkGeo'
import { configureLeafletDefaultIcon } from '../lib/leafletIcon'
import { getDisplayAddress } from '../lib/parkDisplay'

configureLeafletDefaultIcon()

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const DEFAULT_CENTER: L.LatLngExpression = [40.7128, -74.006]
const DEFAULT_ZOOM = 11

type ParkMapProps = {
  parks: readonly Park[]
  selectedParkId: string | null
  onSelectPark: (id: string) => void
}

function MapResizeObserver() {
  const map = useMap()
  const containerRef = useRef(map.getContainer())

  useEffect(() => {
    const container = containerRef.current
    if (!container.parentElement) return

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container.parentElement)

    return () => observer.disconnect()
  }, [map])

  return null
}

function MapInitialViewport({ mapParks }: { mapParks: Park[] }) {
  const map = useMap()
  const didFit = useRef(false)

  useEffect(() => {
    if (didFit.current || mapParks.length === 0) return
    didFit.current = true

    if (mapParks.length === 1) {
      map.setView(parkMapPosition(mapParks[0]), 13)
      return
    }

    const bounds = L.latLngBounds(mapParks.map((park) => parkMapPosition(park)))
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 })
  }, [map, mapParks])

  return null
}

function MapFollowSelection({
  parks: allParks,
  selectedParkId,
}: {
  parks: readonly Park[]
  selectedParkId: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedParkId === null) return
    const park = allParks.find((item) => item.id === selectedParkId)
    if (!park || !parkHasMapLocation(park)) return
    map.panTo(parkMapPosition(park), { animate: true })
  }, [allParks, map, selectedParkId])

  return null
}

type ParkMarkerProps = {
  park: Park
  isSelected: boolean
  onSelectPark: (id: string) => void
}

function ParkMarker({ park, isSelected, onSelectPark }: ParkMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return
    if (isSelected) {
      marker.openPopup()
    } else {
      marker.closePopup()
    }
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={parkMapPosition(park)}
      title={park.name}
      alt={park.name}
      keyboard={false}
      eventHandlers={{
        click: () => {
          onSelectPark(park.id)
        },
      }}
    >
      <Popup>
        <div className="park-map__popup">
          <strong className="park-map__popup-name">{park.name}</strong>
          <p className="park-map__popup-address">{getDisplayAddress(park)}</p>
          <button
            type="button"
            className="park-map__popup-button"
            onClick={() => onSelectPark(park.id)}
          >
            View details
          </button>
        </div>
      </Popup>
    </Marker>
  )
}

export function ParkMap({ parks, selectedParkId, onSelectPark }: ParkMapProps) {
  const mapParks = useMemo(() => getParksWithMapLocation(parks), [parks])
  const mapLabelId = useId()

  if (mapParks.length === 0) {
    return (
      <section
        className="park-map park-map--unavailable"
        aria-labelledby={mapLabelId}
      >
        <h2 id={mapLabelId} className="park-map__heading">
          Map
        </h2>
        <p className="park-map__fallback">
          Map unavailable — no parks have valid coordinates. Use the list to browse
          parks.
        </p>
      </section>
    )
  }

  return (
    <section className="park-map" aria-labelledby={mapLabelId}>
      <h2 id={mapLabelId} className="park-map__heading">
        Map
      </h2>
      <p className="park-map__hint" id="map-usage-hint">
        Optional map for pointer users. The park list provides full access to every park
        if you do not use the map or if it does not load.
      </p>
      <div
        className="park-map__container"
        role="region"
        aria-describedby="map-usage-hint"
        aria-label="Park locations map"
      >
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="park-map__leaflet"
          scrollWheelZoom
          keyboard={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={OSM_ATTRIBUTION}
          />
          <MapResizeObserver />
          <MapInitialViewport mapParks={mapParks} />
          <MapFollowSelection parks={parks} selectedParkId={selectedParkId} />
          {mapParks.map((park) => (
            <ParkMarker
              key={park.id}
              park={park}
              isSelected={park.id === selectedParkId}
              onSelectPark={onSelectPark}
            />
          ))}
        </MapContainer>
      </div>
    </section>
  )
}