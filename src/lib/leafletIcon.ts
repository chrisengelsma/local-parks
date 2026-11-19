import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

let configured = false

/** Default Leaflet marker paths break under Vite; configure once before any map mounts. */
export function configureLeafletDefaultIcon(): void {
  if (configured) return
  configured = true

  const defaultIcon = L.Icon.Default.prototype as L.Icon.Default & {
    _getIconUrl?: unknown
  }
  delete defaultIcon._getIconUrl

  L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
  })
}