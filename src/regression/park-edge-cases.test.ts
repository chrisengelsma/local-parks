import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import sample from '../../assets/parks.sample.json'
import { normalizeParkList, normalizeParkRecord } from '../lib/normalizePark'
import {
  formatAcreage,
  getDisplayAddress,
  getDisplayDescription,
  getImageUrls,
  hasDisplayAddress,
  hasImages,
  isDescriptionMissing,
  isDisplayableAcreage,
  isDisplayableRating,
} from '../lib/parkDisplay'
import {
  getParksWithMapLocation,
  parkHasMapLocation,
} from '../lib/parkGeo'

const parks = normalizeParkList(sample)

function requirePark(id: string) {
  const park = parks.find((item) => item.id === id)
  assert.ok(park, `expected park "${id}" in sample dataset`)
  return park
}

describe('sample dataset edge cases', () => {
  it('Highland Dog Park: listable without address, still mappable', () => {
    const park = requirePark('highland-dog-park')
    assert.equal(park.location.address, undefined)
    assert.equal(getDisplayAddress(park), 'Address not listed')
    assert.equal(hasDisplayAddress(park), false)
    assert.equal(parkHasMapLocation(park), true)
  })

  it('Old Mill Botanical Garden: null description shows explicit fallback', () => {
    const park = requirePark('old-mill-botanical-garden')
    assert.equal(park.description, null)
    assert.equal(isDescriptionMissing(park), true)
    assert.equal(getDisplayDescription(park), 'Description not available.')
  })

  it('Cedar Hill Nature Preserve: no images and null rating', () => {
    const park = requirePark('cedar-hill-nature-preserve')
    assert.deepEqual(park.images, [])
    assert.equal(hasImages(park), false)
    assert.equal(getImageUrls(park).length, 0)
    assert.equal(park.rating, null)
    assert.equal(isDisplayableRating(park.rating), false)
  })

  it('East Ridge Trailhead: empty images array', () => {
    const park = requirePark('east-ridge-trailhead')
    assert.deepEqual(park.images, [])
    assert.equal(hasImages(park), false)
  })

  it('Prospect Park: example-domain URLs are candidates for gallery, not proof of load', () => {
    const park = requirePark('prospect-park')
    const urls = getImageUrls(park)
    assert.ok(urls.length >= 1)
    assert.ok(urls.every((url) => url.includes('images.example.com')))
    assert.equal(hasImages(park), true)
  })
})

describe('P0 data integrity', () => {
  it('sample parks never have NaN acreage after normalize', () => {
    for (const park of parks) {
      assert.ok(
        park.acreage === null || Number.isFinite(park.acreage),
        `park ${park.id} must have null or finite acreage`,
      )
    }
  })

  it('invalid acreage normalizes to null, not NaN', () => {
    const park = normalizeParkRecord({
      id: 'fixture-bad-acreage',
      name: 'Fixture Bad Acreage',
      acreage: 'not-a-number',
    })
    assert.ok(park)
    assert.equal(park!.acreage, null)
    assert.equal(isDisplayableAcreage(park!.acreage), false)
    assert.equal(formatAcreage(park!.acreage), 'Size not listed')
  })
})

describe('synthetic fixture (not in supplied dataset)', () => {
  it('invalid geographic coordinates: park stays in data but off map', () => {
    const park = normalizeParkRecord({
      id: 'fixture-invalid-coords',
      name: 'Fixture Invalid Coords',
      location: { lat: 999, lng: 0 },
      amenities: [],
      hours: 'Dawn to dusk',
      images: [],
      acreage: 1,
      rating: null,
      description: 'Test fixture only.',
    })
    assert.ok(park)
    assert.equal(parkHasMapLocation(park), false)
    assert.equal(
      getParksWithMapLocation([park]).length,
      0,
      'marker layer must not include this park',
    )
  })
})