// hooks/useMap.ts
import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Coordinate } from 'ol/coordinate';

interface UseMapReturn {
  mapRef: React.RefObject<HTMLDivElement>;
  map: Map | null;
}

export const useMap = (
  initialCenter: Coordinate,
  initialZoom: number
): UseMapReturn => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: initialCenter,
        zoom: initialZoom,
      }),
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
    };
    // 의도적으로 빈 배열 유지: 지도는 한 번만 초기화되어야 함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mapRef, map };
};