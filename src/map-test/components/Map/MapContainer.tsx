// components/Map/MapContainer.tsx
import React from 'react';
import { useMap } from '../../hooks/useMap';
import { MapContainerProps, VectorLayerProps } from '../../types/map.types';
import './MapContainer.css';

const MapContainer: React.FC<MapContainerProps> = ({
  center,
  zoom,
  children
}) => {
  const { mapRef, map } = useMap(center, zoom);

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container" />
      {map && React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map } as Partial<VectorLayerProps>);
        }
        return child;
      })}
    </div>
  );
};

export default MapContainer;