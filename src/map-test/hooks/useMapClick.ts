// hooks/useMapClick.ts
import { useEffect } from 'react';
import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';

type ClickHandler = (coordinate: Coordinate) => void;

export const useMapClick = (
  map: Map | null,
  handler: ClickHandler
): void => {
  useEffect(() => {
    if (!map) return;

    const handleClick = (event: any) => {
      const coordinate = event.coordinate;
      handler(coordinate);
    };

    map.on('click', handleClick);

    return () => {
      map.un('click', handleClick);
    };
  }, [map, handler]);
};