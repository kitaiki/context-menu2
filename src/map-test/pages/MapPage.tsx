// pages/MapPage.tsx
import React, { useMemo } from 'react';
import MapContainer from '../components/Map/MapContainer';
import MapVectorLayer from '../components/Map/VectorLayer';
import { createMarker, coordinateToLonLat } from '../utils/mapUtils';

const MapPage: React.FC = () => {
  const markers = useMemo(() => [
    createMarker(127.0276, 37.4979, { name: '서울' }),
    createMarker(129.0756, 35.1796, { name: '부산' }),
  ], []);

  return (
    <MapContainer 
      center={coordinateToLonLat(127.0276, 37.4979)} 
      zoom={7}
    >
      <MapVectorLayer features={markers} />
    </MapContainer>
  );
};

export default MapPage;