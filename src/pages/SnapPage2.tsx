import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { LineString } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import 'ol/ol.css';

interface SnapPointInfo {
  type: 'start' | 'end';
  coordinate: Coordinate;
  isSnapped: boolean;
}

const SnapPage2: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const lastSnapCoordRef = useRef<Coordinate | null>(null);
  const clickSnapStatusRef = useRef<(Coordinate | null)[]>([]);

  const [snapped, setSnapped] = useState(false);
  const [snapPoints, setSnapPoints] = useState<SnapPointInfo[]>([]);

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

    // Listen to snap events
    snap.on('snap', (event: any) => {
      setSnapped(true);
      const coord = event.vertex || event.coordinate;
      lastSnapCoordRef.current = coord;
      console.log('Snap event - vertex:', event.vertex, 'edge:', event.coordinate);
    });

    map.on('pointermove', () => {
      setSnapped(false);
      // pointermove에서 snap 정보를 초기화하지 않음
      // 클릭할 때까지 마지막 snap 정보를 유지하여 타이밍 문제 방지
    });

    // Cleanup
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Handle draw interaction
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const snap = snapRef.current;
    if (!map || !vectorSource || !snap) return;

    // Remove existing draw interaction
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    const draw = new Draw({
      source: vectorSource,
      type: 'LineString',
    });

    draw.on('drawstart', () => {
      setSnapPoints([]);
      clickSnapStatusRef.current = [];
      console.log('=== Draw Started ===');
    });

    draw.on('drawabort', () => {
      clickSnapStatusRef.current = [];
    });

    // Track clicks during drawing
    map.on('click', () => {
      if (drawRef.current) {
        // Store snap coordinate if exists, null otherwise
        if (lastSnapCoordRef.current) {
          clickSnapStatusRef.current.push([...lastSnapCoordRef.current]);
          console.log('Click WITH snap:', lastSnapCoordRef.current);
          // 클릭 후 snap 정보 초기화 (다음 클릭을 위해)
          lastSnapCoordRef.current = null;
        } else {
          clickSnapStatusRef.current.push(null);
          console.log('Click WITHOUT snap');
        }
      }
    });

    draw.on('drawend', (event: DrawEvent) => {
      const geometry = event.feature.getGeometry();

      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        const startPoint = coordinates[0];
        const endPoint = coordinates[coordinates.length - 1];

        console.log('=== Draw End Analysis ===');
        console.log('Total coordinates:', coordinates.length);
        console.log('Total clicks recorded:', clickSnapStatusRef.current.length);
        console.log('Start point:', startPoint);
        console.log('End point:', endPoint);

        const detectedSnapPoints: SnapPointInfo[] = [];

        // Get first and last click snap status
        const firstClickSnap = clickSnapStatusRef.current[0];
        const lastClickSnap = clickSnapStatusRef.current[clickSnapStatusRef.current.length - 1];

        // Check start point
        const startSnapped = checkIfSnapped(startPoint, firstClickSnap);
        detectedSnapPoints.push({
          type: 'start',
          coordinate: startPoint,
          isSnapped: startSnapped,
        });

        console.log(startSnapped ? '✓ Start point is SNAPPED' : '✗ Start point is NOT snapped');

        // Check end point
        const endSnapped = checkIfSnapped(endPoint, lastClickSnap);
        detectedSnapPoints.push({
          type: 'end',
          coordinate: endPoint,
          isSnapped: endSnapped,
        });

        console.log(endSnapped ? '✓ End point is SNAPPED' : '✗ End point is NOT snapped');

        setSnapPoints(detectedSnapPoints);

        console.log('=== Final Results ===');
        console.log('Start point snapped:', startSnapped);
        console.log('End point snapped:', endSnapped);

        // Clear for next draw
        clickSnapStatusRef.current = [];
      }
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    // Remove and re-add snap to ensure it's on top
    map.removeInteraction(snap);
    map.addInteraction(snap);
  }, []);

  // Helper function to check if coordinate was snapped
  const checkIfSnapped = (coord: Coordinate, snapCoord: Coordinate | null): boolean => {
    if (!snapCoord) return false;

    const distance = Math.sqrt(
      Math.pow(coord[0] - snapCoord[0], 2) +
      Math.pow(coord[1] - snapCoord[1], 2)
    );

    // Consider it snapped if within 1 pixel
    return distance < 1;
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Snap Interaction - LineString Start/End Points Only
        </h1>

        {/* Map Container */}
        <div
          ref={mapRef}
          id="map"
          className="w-full h-[400px] border border-gray-300 rounded-lg shadow-lg mb-4"
        />

        {/* Snapped Status */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-300 space-y-3">
          <div>
            <span className="font-semibold">
              Currently Snapping: <span className={snapped ? 'text-green-600' : 'text-red-600'}>{String(snapped)}</span>
            </span>
          </div>

          {snapPoints.length > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2">
                LineString Snap Results
              </h4>
              <div className="space-y-2">
                {snapPoints.map((snapInfo, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded border ${
                      snapInfo.isSnapped
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800">
                        {snapInfo.type === 'start' ? '시작점' : '끝점'}
                      </span>
                      <span className={`font-bold ${
                        snapInfo.isSnapped ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {snapInfo.isSnapped ? '✓ SNAPPED' : '✗ NOT SNAPPED'}
                      </span>
                    </div>
                    <div className="text-gray-700 font-mono text-[10px]">
                      X: {snapInfo.coordinate[0].toFixed(2)}, Y: {snapInfo.coordinate[1].toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">사용 방법</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• LineString을 그려서 기존 선과 연결해보세요</li>
            <li>• 시작점과 끝점이 기존 선에 스냅되었는지 확인할 수 있습니다</li>
            <li>• 중간점은 무시되고 시작점/끝점만 표시됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SnapPage2;
