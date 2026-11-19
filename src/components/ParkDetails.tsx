import type { Park } from '../types/park'
import {
  formatAcreage,
  formatRating,
  getAmenitiesFallback,
  getAmenitiesForDisplay,
  getDisplayAddress,
  getDisplayDescription,
  getDisplayHours,
  getImageUrls,
  hasAmenities,
  hasDisplayAddress,
  isDisplayableAcreage,
  hasImages,
  isDescriptionMissing,
  isDisplayableRating,
  isHoursMissing,
} from '../lib/parkDisplay'
import { ParkImage } from './ParkImage'

type ParkDetailsProps = {
  park: Park | undefined
}

function EmptyState() {
  return (
    <section className="park-details park-details--empty" aria-labelledby="details-heading">
      <h2 id="details-heading" className="park-details__heading">
        Park details
      </h2>
      <p>Select a park from the list to view its information.</p>
    </section>
  )
}

export function ParkDetails({ park }: ParkDetailsProps) {
  if (!park) {
    return <EmptyState />
  }

  const imageUrls = getImageUrls(park)
  const showGallery = hasImages(park)

  return (
    <article className="park-details" aria-labelledby="details-heading">
      <h2 id="details-heading" className="park-details__heading">
        {park.name}
      </h2>

      {showGallery ? (
        <div className="park-details__gallery">
          {imageUrls.map((url, index) => (
            <ParkImage
              key={`${park.id}-image-${index}`}
              src={url}
              alt={index === 0 ? `Photo of ${park.name}` : ''}
              isPrimary={index === 0}
            />
          ))}
        </div>
      ) : (
        <p className="park-details__no-photos">No photos available</p>
      )}

      <dl className="park-details__facts">
        <div className="park-details__fact">
          <dt>Location</dt>
          <dd className={hasDisplayAddress(park) ? undefined : 'park-details__missing'}>
            {getDisplayAddress(park)}
          </dd>
        </div>
        <div className="park-details__fact">
          <dt>Hours</dt>
          <dd className={isHoursMissing(park) ? 'park-details__missing' : undefined}>
            {getDisplayHours(park)}
          </dd>
        </div>
        <div className="park-details__fact">
          <dt>Size</dt>
          <dd className={isDisplayableAcreage(park.acreage) ? undefined : 'park-details__missing'}>
            {formatAcreage(park.acreage)}
          </dd>
        </div>
        {isDisplayableRating(park.rating) && (
          <div className="park-details__fact">
            <dt>Rating</dt>
            <dd>{formatRating(park.rating)} out of 5</dd>
          </div>
        )}
      </dl>

      <section className="park-details__section" aria-labelledby="description-heading">
        <h3 id="description-heading">Description</h3>
        <p className={isDescriptionMissing(park) ? 'park-details__missing' : undefined}>
          {getDisplayDescription(park)}
        </p>
      </section>

      <section className="park-details__section" aria-labelledby="amenities-heading">
        <h3 id="amenities-heading">Amenities</h3>
        {hasAmenities(park) ? (
          <ul className="park-details__amenities">
            {getAmenitiesForDisplay(park).map((label, index) => (
              <li key={`${park.id}-amenity-${index}`}>{label}</li>
            ))}
          </ul>
        ) : (
          <p className="park-details__missing">{getAmenitiesFallback()}</p>
        )}
      </section>
    </article>
  )
}