'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '350px'
};

// Default center to New Delhi, India if no location is provided
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

interface LocationPickerProps {
  initialLocation?: { lat: number, lng: number };
  onLocationSelect: (location: { lat: number, lng: number }, address: string) => void;
}

export default function LocationPicker({ initialLocation, onLocationSelect }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
  const [isLocating, setIsLocating] = useState(false);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoder.current) {
        geocoder.current = new window.google.maps.Geocoder();
    }
    geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
            onLocationSelect({ lat, lng }, results[0].formatted_address);
        } else {
            console.error('Geocoder failed due to: ' + status);
            onLocationSelect({ lat, lng }, '');
        }
    });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMarkerPosition(newPos);
          if (map) {
            map.panTo(newPos);
            map.setZoom(16);
          }
          reverseGeocode(newPos.lat, newPos.lng);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          setIsLocating(false);
          alert("Could not get your location. Please check your browser permissions.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="location-picker">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          onClick={getUserLocation}
          disabled={isLocating}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            opacity: isLocating ? 0.7 : 1
          }}
        >
          {isLocating ? 'Locating...' : '📍 Use My Current Location'}
        </button>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          <MarkerF 
            position={markerPosition} 
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        </GoogleMap>
      </div>
      <p style={{ marginTop: '0.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Drag the pin or tap on the map to set your exact delivery location.
      </p>
    </div>
  );
}
