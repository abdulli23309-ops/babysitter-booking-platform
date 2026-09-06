import { useState, useCallback, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, Circle } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '220px',
  borderRadius: '20px',
  overflow: 'hidden',
};

const DEFAULT_CENTER = {
  lat: 31.5204, // Lahore
  lng: 74.3587,
};

const CIRCLE_OPTIONS = {
  strokeColor: '#E8622A',
  strokeOpacity: 0.85,
  strokeWeight: 2,
  fillColor: '#E8622A',
  fillOpacity: 0.2,
  clickable: false,
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function GoogleMapRadiusPicker({
  initialCenter = DEFAULT_CENTER,
  onLocationChange,
  onAreaDetected,
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [authError, setAuthError] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [position, setPosition] = useState(initialCenter);

  // Catch Google Maps authorization errors (e.g. ApiProjectMapError / NoApiKeys)
  useEffect(() => {
    window.gm_authFailure = () => {
      setAuthError(true);
    };
    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  const performReverseGeocode = useCallback((coords) => {
    if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            let sublocality = '';
            let locality = '';
            for (const comp of results[0].address_components) {
              if (
                comp.types.includes('sublocality') ||
                comp.types.includes('sublocality_level_1') ||
                comp.types.includes('neighborhood')
              ) {
                sublocality = comp.long_name;
              }
              if (comp.types.includes('locality')) {
                locality = comp.long_name;
              }
            }
            const areaText = sublocality && locality
              ? `${sublocality}, ${locality}`
              : (results[0].formatted_address?.split(',').slice(0, 2).join(',').trim() || 'Custom Area');
            if (onAreaDetected) {
              onAreaDetected(areaText, coords);
            }
          }
        });
      } catch {
        // Silently handle geocoder errors
      }
    }
  }, [onAreaDetected]);

  const handleMarkerDrag = useCallback((e) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPosition(newPos);
    }
  }, []);

  const handleMarkerDragEnd = useCallback((e) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPosition(newPos);
      if (onLocationChange) {
        onLocationChange(newPos);
      }
      performReverseGeocode(newPos);
    }
  }, [onLocationChange, performReverseGeocode]);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPosition(newPos);
      if (onLocationChange) {
        onLocationChange(newPos);
      }
      performReverseGeocode(newPos);
    }
  }, [onLocationChange, performReverseGeocode]);

  const isMapAvailable = Boolean(apiKey) && isLoaded && !loadError && !authError;

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      {isMapAvailable ? (
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={position}
          zoom={13}
          options={MAP_OPTIONS}
          onClick={handleMapClick}
        >
          {/* Draggable Uber/Careem style marker with MarkerF to eliminate React 18/19 warnings */}
          <MarkerF
            position={position}
            draggable={true}
            onDrag={handleMarkerDrag}
            onDragEnd={handleMarkerDragEnd}
          />
          {/* Real-time 3km (3000 meters) boundary circle */}
          <Circle
            center={position}
            radius={3000}
            options={CIRCLE_OPTIONS}
          />
        </GoogleMap>
      ) : (
        /* Graceful Interactive Fallback if Google Maps Key is pending or has auth error */
        <div
          style={{
            width: '100%',
            height: '220px',
            background: 'radial-gradient(circle at center, #FFF5EE 0%, #FEECE5 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            textAlign: 'center',
            position: 'relative',
            border: '2px dashed #E8622A',
            borderRadius: '20px',
          }}
        >
          {/* Animated 3km simulated radius */}
          <div
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'rgba(232, 98, 42, 0.15)',
              border: '2px dashed #E8622A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#E8622A',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(232, 98, 42, 0.4)',
              }}
            >
              📍
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, marginTop: '90px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#E8622A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authentic 3 km Working Radius
            </span>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>
              {!apiKey
                ? 'Please configure Google Maps API Key in .env'
                : authError
                ? 'Google Maps Auth Error: Check API Key billing/restrictions'
                : 'Connecting to Google Maps...'}
            </p>
          </div>
        </div>
      )}

      {/* Floating 3km Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#E8622A',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <span>📍</span>
        <span>3 km working radius</span>
      </div>
    </div>
  );
}
