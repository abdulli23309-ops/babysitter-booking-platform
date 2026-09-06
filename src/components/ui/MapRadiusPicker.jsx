import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './map-radius-picker.module.css';

/**
 * Custom Leaflet marker pin icon designed to match the app's coral theme (#E8622A).
 * Created using L.divIcon so it doesn't depend on external image assets that could 404.
 */
const customPinIcon = L.divIcon({
  className: 'custom-leaflet-pin',
  html: `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      background: #E8622A;
      border: 3px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(232, 98, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #FFFFFF;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

/**
 * Recenter the map view when center/location props change
 */
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

/**
 * Handles map click events to reposition the work center pin
 */
function MapEventsHandler({ onChange }) {
  useMapEvents({
    click(e) {
      if (onChange && e.latlng) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function MapRadiusPicker({
  center = { lat: 33.6844, lng: 73.0479 },
  value,
  radiusKm = 5,
  onChange,
}) {
  const activePosition = value && typeof value.lat === 'number' && typeof value.lng === 'number'
    ? value
    : center;

  const lat = activePosition?.lat ?? 33.6844;
  const lng = activePosition?.lng ?? 73.0479;
  const radiusMeters = (radiusKm || 5) * 1000;

  return (
    <div className={styles.wrap}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        className={styles.realMapContainer}
        style={{ height: '230px', width: '100%', borderRadius: '16px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 5 km radius circle around the active location */}
        <Circle
          center={[lat, lng]}
          radius={radiusMeters}
          pathOptions={{
            color: '#E8622A',
            fillColor: '#E8622A',
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '6, 6',
          }}
        />

        {/* Pin Marker */}
        <Marker
          position={[lat, lng]}
          icon={customPinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const marker = e.target;
              if (marker && onChange) {
                const newPos = marker.getLatLng();
                onChange({ lat: newPos.lat, lng: newPos.lng });
              }
            },
          }}
        />

        <MapRecenter center={{ lat, lng }} />
        <MapEventsHandler onChange={onChange} />
      </MapContainer>

      {/* Floating Glassmorphism Badge */}
      <div className={styles.badge}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4.5" />
        </svg>
        <span>{radiusKm} km working radius</span>
      </div>

      {/* Coordinates Chip */}
      <div className={styles.coords}>
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  );
}

