import React, { useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Pool } from '../api';

interface MapProps {
  pools: Pool[];
  center: { lat: number; lng: number };
  selectedPool: Pool | null;
  onPoolSelect: (pool: Pool | null) => void;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const libraries: 'places'[] = ['places'];

const Map: React.FC<MapProps> = ({
  pools,
  center,
  selectedPool,
  onPoolSelect,
  onMapClick,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef<google.maps.Map>();
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = undefined;
  }, []);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      onPoolSelect(null); // Clear selection when clicking on empty map area
      onMapClick(event);
    },
    [onPoolSelect, onMapClick]
  );

  const handleMarkerClick = useCallback(
    (pool: Pool) => {
      onPoolSelect(pool);
    },
    [onPoolSelect]
  );

  const handleInfoWindowClose = useCallback(() => {
    onPoolSelect(null);
  }, [onPoolSelect]);

  // Center map on selected pool
  useEffect(() => {
    if (selectedPool && mapRef.current) {
      mapRef.current.panTo({
        lat: selectedPool.latitude,
        lng: selectedPool.longitude,
      });
      mapRef.current.setZoom(15);
    }
  }, [selectedPool]);

  if (!isLoaded) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={options}
    >
      {pools.map((pool) => (
        <Marker
          key={pool.id}
          position={{ lat: pool.latitude, lng: pool.longitude }}
          onClick={() => handleMarkerClick(pool)}
          icon={{
            url: '/pool-marker.png', // You can add a custom marker icon
            scaledSize: new window.google.maps.Size(40, 40),
          }}
        />
      ))}

      {selectedPool && (
        <InfoWindow
          position={{
            lat: selectedPool.latitude,
            lng: selectedPool.longitude,
          }}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="info-window">
            <h3>{selectedPool.name}</h3>
            <p>{selectedPool.address}</p>
            {selectedPool.description && (
              <p className="description">{selectedPool.description}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(Map);
