import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { LineString, Point, Polygon, Circle as CircleGeom } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import 'ol/ol.css';

type DrawType = 'Point' | 'LineString' | 'Polygon' | 'Circle';
type InteractionMode = 'draw' | 'modify';

interface SnapInfo {
  coordinate: Coordinate;
  isSnapped: boolean;
}

const SnapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const lastSnapCoordRef = useRef<Coordinate | null>(null);
  const currentDrawingCoordsRef = useRef<Coordinate[]>([]);

  const [snapped, setSnapped] = useState(false);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('draw');
  const [drawType, setDrawType] = useState<DrawType>('LineString');
  const [snapPoints, setSnapPoints] = useState<SnapInfo[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    const raster = new TileLayer({
      source: new OSM(),
    });

    const vector = new VectorLayer({
      source: vectorSource,
      style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#ffcc33',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#ffcc33',
      },
    });

    const map = new Map({
      layers: [raster, vector],
      target: mapRef.current,
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
      }),
    });

    mapInstanceRef.current = map;

    // Add snap interaction
    const snap = new Snap({
      source: vectorSource,
    });
    map.addInteraction(snap);
    snapRef.current = snap;

    // Listen to snap events - only track the most recent snap coordinate
    snap.on('snap', (event: any) => {
      setSnapped(true);
      const coord = event.vertex || event.coordinate;
      lastSnapCoordRef.current = coord;
      console.log('Snap event - coordinate:', coord);
    });

    map.on('pointermove', () => {
      setSnapped(false);
    });

    // Cleanup
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Handle interaction changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const snap = snapRef.current;
    if (!map || !vectorSource || !snap) return;

    // Remove existing draw and modify interactions
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    if (modifyRef.current) {
      map.removeInteraction(modifyRef.current);
      modifyRef.current = null;
    }

    // Add appropriate interaction based on mode
    if (interactionMode === 'draw') {
      const draw = new Draw({
        source: vectorSource,
        type: drawType,
      });

      draw.on('drawstart', () => {
        setSnapPoints([]);
        currentDrawingCoordsRef.current = [];
        console.log('Draw started');
      });

      // Track coordinates as they are added during drawing
      draw.on('drawabort', () => {
        currentDrawingCoordsRef.current = [];
      });

      // Listen to clicks during drawing to capture snap status
      map.on('click', () => {
        if (drawRef.current) {
          // Store the current snap coordinate if it exists
          if (lastSnapCoordRef.current) {
            currentDrawingCoordsRef.current.push([...lastSnapCoordRef.current]);
            console.log('Click with snap:', lastSnapCoordRef.current);
          } else {
            // Mark as null to indicate this point was NOT snapped
            currentDrawingCoordsRef.current.push(null as any);
            console.log('Click without snap');
          }
        }
      });

      draw.on('drawend', (event: DrawEvent) => {
        const geometry = event.feature.getGeometry();

        if (geometry) {
          let coordinates: Coordinate[] = [];

          if (geometry instanceof LineString) {
            coordinates = geometry.getCoordinates();
          } else if (geometry instanceof Polygon) {
            coordinates = geometry.getCoordinates()[0];
          } else if (geometry instanceof Point) {
            coordinates = [geometry.getCoordinates()];
          } else if (geometry instanceof CircleGeom) {
            coordinates = [geometry.getCenter()];
          }

          const detectedSnapPoints: SnapInfo[] = [];
          const snappedCoords = currentDrawingCoordsRef.current.filter(c => c !== null);

          console.log('=== Draw End Analysis ===');
          console.log('Total coordinates:', coordinates.length);
          console.log('Snapped clicks recorded:', snappedCoords.length);

          // Check each coordinate to see if it was snapped
          coordinates.forEach((coord, coordIndex) => {
            // Check if this coordinate matches any of our recorded snap coordinates
            const wasSnapped = snappedCoords.some(snapCoord => {
              if (!snapCoord) return false;
              const distance = Math.sqrt(
                Math.pow(coord[0] - snapCoord[0], 2) +
                Math.pow(coord[1] - snapCoord[1], 2)
              );
              // Consider it a match if within 1 pixel (very small threshold)
              return distance < 1;
            });

            if (wasSnapped) {
              console.log(`✓ Point ${coordIndex} is SNAPPED:`, coord);
              detectedSnapPoints.push({
                coordinate: coord,
                isSnapped: true,
              });
            } else {
              console.log(`✗ Point ${coordIndex} is NOT snapped:`, coord);
            }
          });

          setSnapPoints(detectedSnapPoints);

          // Log final results
          console.log('=== Final Results ===');
          console.log('Total coordinates:', coordinates.length);
          console.log('Snapped points detected:', detectedSnapPoints.length);
          detectedSnapPoints.forEach((snapInfo, index) => {
            console.log(`Snap point ${index + 1}:`, snapInfo.coordinate);
          });

          // Clear for next draw
          currentDrawingCoordsRef.current = [];
        }
      });

      map.addInteraction(draw);
      drawRef.current = draw;

      // Remove and re-add snap to ensure it's on top
      map.removeInteraction(snap);
      map.addInteraction(snap);
    } else if (interactionMode === 'modify') {
      const modify = new Modify({
        source: vectorSource,
      });
      map.addInteraction(modify);
      modifyRef.current = modify;

      // Remove and re-add snap to ensure it's on top
      map.removeInteraction(snap);
      map.addInteraction(snap);
    }
  }, [interactionMode, drawType]);

  const handleInteractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInteractionMode(e.target.value as InteractionMode);
  };

  const handleDrawTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDrawType(e.target.value as DrawType);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Snap Interaction</h1>

        {/* Map Container */}
        <div
          ref={mapRef}
          id="map"
          className="w-full h-[400px] border border-gray-300 rounded-lg shadow-lg mb-4"
        />

        {/* Snapped Status */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-300 space-y-3">
          <div>
            <span id="snapped" className="font-semibold">
              Snapped: <span className={snapped ? 'text-green-600' : 'text-red-600'}>{String(snapped)}</span>
            </span>
          </div>

          {snapPoints.length > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2">
                Snapped Points ({snapPoints.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {snapPoints.map((snapInfo, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border border-blue-100">
                    <div className="font-semibold text-blue-800">Point {index + 1}:</div>
                    <div className="text-gray-700 font-mono">
                      X: {snapInfo.coordinate[0].toFixed(2)}, Y: {snapInfo.coordinate[1].toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Options Form */}
        <form id="options-form" autoComplete="off" className="bg-white p-4 rounded-lg shadow border border-gray-300 space-y-3">
          <div className="radio flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="interaction"
                value="draw"
                id="draw"
                checked={interactionMode === 'draw'}
                onChange={handleInteractionChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Draw</span>
            </label>
            <select
              name="draw-type"
              id="draw-type"
              value={drawType}
              onChange={handleDrawTypeChange}
              disabled={interactionMode !== 'draw'}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="Point">Point</option>
              <option value="LineString">LineString</option>
              <option value="Polygon">Polygon</option>
              <option value="Circle">Circle</option>
            </select>
          </div>

          <div className="radio">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="interaction"
                value="modify"
                checked={interactionMode === 'modify'}
                onChange={handleInteractionChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-700">Modify</span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnapPage;



// 스냅된 포인트가 나올때도 있고 않나올때도 있어 좌표의 소수점 문제일까?