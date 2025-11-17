// utils/mapUtils.ts
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Map from 'ol/Map';
import { Extent } from 'ol/extent';
import { FitOptions } from 'ol/View';
import { MarkerProperties } from '../types/map.types';

export const createMarker = (
  lon: number,
  lat: number,
  properties: MarkerProperties = {}
): Feature<Point> => {
  const marker = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
    ...properties,
  });
  return marker;
};

export const fitToExtent = (
  map: Map,
  extent: Extent,
  options: FitOptions = {}
): void => {
  map.getView().fit(extent, {
    padding: [50, 50, 50, 50],
    duration: 1000,
    ...options,
  });
};

export const coordinateToLonLat = (
  lon: number,
  lat: number
): number[] => {
  return fromLonLat([lon, lat]);
};