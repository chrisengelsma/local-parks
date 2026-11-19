import { useState } from 'react'

type ParkImageProps = {
  src: string
  alt: string
  isPrimary?: boolean
}

export function ParkImage({ src, alt, isPrimary = false }: ParkImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (!isPrimary) return null
    return (
      <p className="park-image__unavailable" role="status">
        Photo unavailable
      </p>
    )
  }

  return (
    <img
      className="park-image"
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}