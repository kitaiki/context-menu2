// components/Map/VectorLayer.tsx
import { useEffect, useMemo } from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useLayer } from '../../hooks/useLayer';
import { VectorLayerProps } from '../../types/map.types';

const MapVectorLayer: React.FC<VectorLayerProps> = ({
  map,
  features,
  style
}) => {
  const layer = useMemo(() => {
    return new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
      style: style,
    });
  }, [features, style]);

  useLayer(map || null, layer);

  useEffect(() => {
    if (layer) {
      const source = layer.getSource();
      if (source) {
        source.clear();
        source.addFeatures(features);
      }
    }
  }, [features, layer]);

  return null;
};

export default MapVectorLayer;