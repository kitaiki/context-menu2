// types/map.types.ts
import { Coordinate } from 'ol/coordinate';
import { Style } from 'ol/style';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import Map from 'ol/Map';

export interface MapContainerProps {
  center: Coordinate;
  zoom: number;
  children?: React.ReactNode;
}

export interface VectorLayerProps {
  map?: Map | null;
  features: Feature<Geometry>[];
  style?: Style | Style[];
}

export interface MarkerProperties {
  name?: string;
  [key: string]: any;
}