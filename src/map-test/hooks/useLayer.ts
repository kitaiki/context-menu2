// hooks/useLayer.ts
import { useEffect } from 'react';
import Map from 'ol/Map';
import BaseLayer from 'ol/layer/Base';

export const useLayer = (map: Map | null, layer: BaseLayer | null): void => {
  useEffect(() => {
    if (!map || !layer) return;

    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer]);
};