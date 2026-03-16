import { useState, useEffect, useCallback } from 'react'

// Fixed dark store location (permanent)
const STORE_LAT = 25.888851165771484
const STORE_LNG = 93.77086639404297

// Haversine formula for distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Estimate delivery time based on distance
function estimateDeliveryTime(distKm) {
  if (distKm <= 1) return '8 minutes'
  if (distKm <= 2) return '12 minutes'
  if (distKm <= 3) return '15 minutes'
  if (distKm <= 5) return '20 minutes'
  if (distKm <= 8) return '25 minutes'
  if (distKm <= 10) return '30 minutes'
  if (distKm <= 15) return '35 minutes'
  return '45 minutes'
}

export function useUserLocation() {
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: null,
    distance: null,
    deliveryTime: null,
    loading: true,
    error: null,
    permissionDenied: false,
  })

  const reverseGeocode = useCallback(async (lat, lng) => {
    // Wait for Google Maps API to load
    if (!window.google?.maps?.Geocoder) {
      // Fallback: try again after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    if (window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder()
        const response = await geocoder.geocode({ location: { lat, lng } })
        if (response.results && response.results.length > 0) {
          // Get a short, readable address
          const result = response.results[0]
          const components = result.address_components
          const sublocality = components.find(c =>
            c.types.includes('sublocality_level_1') || c.types.includes('sublocality')
          )
          const locality = components.find(c => c.types.includes('locality'))
          const area = sublocality?.long_name || ''
          const city = locality?.long_name || ''
          return area ? `${area}, ${city}` : city || result.formatted_address
        }
      } catch (err) {
        console.warn('Geocoding failed:', err)
      }
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }, [])

  const requestLocation = useCallback(() => {
    setLocation(prev => ({ ...prev, loading: true, error: null }))

    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation not supported by your browser',
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        const dist = haversineDistance(lat, lng, STORE_LAT, STORE_LNG)
        const address = await reverseGeocode(lat, lng)

        setLocation({
          lat,
          lng,
          address,
          distance: Math.round(dist * 10) / 10,
          deliveryTime: estimateDeliveryTime(dist),
          loading: false,
          error: null,
          permissionDenied: false,
        })
      },
      (err) => {
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: err.message,
          permissionDenied: err.code === 1,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    )
  }, [reverseGeocode])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return { ...location, requestLocation }
}
