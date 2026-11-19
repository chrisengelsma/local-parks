export type ParkLocation = {
  lat: number
  lng: number
  address?: string
}

export type Park = {
  id: string
  name: string
  description: string | null
  location: ParkLocation
  amenities: string[]
  hours: string
  images: string[]
  acreage: number | null
  rating: number | null
}