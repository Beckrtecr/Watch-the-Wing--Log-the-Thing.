import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Locks/unlocks the map for freehand drawing ──────────────────────────────
function MapLock({ locked }) {
  const map = useMap();
  useEffect(() => {
    if (locked) {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      map.boxZoom.disable();
    } else {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
    }
  }, [locked, map]);
  return null;
}

// ── Captures mouse/touch/stylus events and streams lat/lng points ───────────
function FreehandDrawLayer({ onPoint, onMark, pickerMode, drawingMode }) {
  const map = useMapEvents({
    click(e) {
      if (drawingMode) return; // handled by pointer events
      if (!pickerMode && onMark) onMark(e.latlng);
    },
    moveend() {}
  });

  // Pointer event handlers wired directly onto the map container
  useEffect(() => {
    if (!drawingMode) return;

    const container = map.getContainer();
    let isDown = false;
    let lastAddedTime = 0;
    const THROTTLE_MS = 40; // ~25 points/sec max

    const getLatLng = (e) => {
      const rect = container.getBoundingClientRect();
      let clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const point = L.point(clientX - rect.left, clientY - rect.top);
      return map.containerPointToLatLng(point);
    };

    const onPointerDown = (e) => {
      isDown = true;
      const latlng = getLatLng(e);
      onPoint(latlng, 'start');
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const now = Date.now();
      if (now - lastAddedTime < THROTTLE_MS) return;
      lastAddedTime = now;
      const latlng = getLatLng(e);
      onPoint(latlng, 'move');
      e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!isDown) return;
      isDown = false;
      const latlng = getLatLng(e);
      onPoint(latlng, 'end');
    };

    container.addEventListener('pointerdown', onPointerDown, { passive: false });
    container.addEventListener('pointermove', onPointerMove, { passive: false });
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', onPointerUp);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointerleave', onPointerUp);
    };
  }, [drawingMode, map, onPoint]);

  return null;
}

// ── Auto-fits map to markers ────────────────────────────────────────────────
function RecenterMap({ markers, flightPaths, pickerMode, drawingMode }) {
  const map = useMap();
  useEffect(() => {
    if (!pickerMode && markers.length > 0 && !drawingMode) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      if (flightPaths?.length > 0) {
        flightPaths.forEach(path => {
          path.points.forEach(p => bounds.extend([p.lat, p.lng]));
        });
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map, drawingMode]);
  return null;
}

// ── Main BirdMap component ──────────────────────────────────────────────────
function BirdMap({
  onMark,
  onMove,
  initialPosition,
  markers = [],
  pickerMode = false,
  flightPaths = [],
  drawingMode = false,
  onFreehandPoint,   // called with (latlng, phase) during freehand drawing
  livePoints = [],   // current in-progress stroke points
}) {
  const [position] = useState(initialPosition || [40.8751, -73.5323]);

  const handlePoint = useCallback((latlng, phase) => {
    if (onFreehandPoint) onFreehandPoint(latlng, phase);
  }, [onFreehandPoint]);

  return (
    <div
      style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}
      className={drawingMode ? 'drawing-cursor' : ''}
    >
      <MapContainer
        center={position}
        zoom={pickerMode ? 2 : 13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={!drawingMode}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.4}
        />

        <MapLock locked={drawingMode} />
        <FreehandDrawLayer
          onPoint={handlePoint}
          onMark={onMark}
          pickerMode={pickerMode}
          drawingMode={drawingMode}
        />
        <RecenterMap
          markers={markers}
          flightPaths={flightPaths}
          pickerMode={pickerMode}
          drawingMode={drawingMode}
        />

        {/* Live stroke being drawn */}
        {drawingMode && livePoints.length > 1 && (
          <>
            <Polyline
              positions={livePoints.map(p => [p.lat, p.lng])}
              color="#6366f1"
              weight={5}
              opacity={0.7}
              dashArray="1, 8"
              lineCap="round"
            />
            <Polyline
              positions={livePoints.map(p => [p.lat, p.lng])}
              color="#818cf8"
              weight={12}
              opacity={0.15}
            />
          </>
        )}

        {/* Saved Flight Paths */}
        {flightPaths?.map((path, pIdx) => (
          <React.Fragment key={pIdx}>
            <Polyline
              positions={path.points.map(p => [p.lat, p.lng])}
              color="#6366f1"
              dashArray="1, 10"
              lineCap="round"
              lineJoin="round"
              weight={6}
              opacity={0.8}
            />
            <Polyline
              positions={path.points.map(p => [p.lat, p.lng])}
              color="#818cf8"
              weight={12}
              opacity={0.15}
            />
            {path.points.map((p, idx) => p.label ? (
              <Marker
                key={`${pIdx}-${idx}`}
                position={[p.lat, p.lng]}
                icon={L.divIcon({
                  className: 'path-point-wrapper',
                  html: `
                    <div class="flight-point-dot"></div>
                    <div class="flight-path-label">${p.label}</div>
                  `,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              />
            ) : null)}
          </React.Fragment>
        ))}

        {/* Map Pins */}
        {markers.map((m, idx) => (
          <Marker
            key={idx}
            position={[m.lat, m.lng]}
            eventHandlers={{ click: () => m.onClick && m.onClick(m) }}
            icon={L.divIcon({
              className: 'marker-wrapper',
              html: `
                <div class="map-label">${m.label || m.name}</div>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#2563eb" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="${m.color || '#2563eb'}" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" fill="white"/>
                </svg>
              `,
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })}
          >
            <Popup>{m.label || m.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default BirdMap;
