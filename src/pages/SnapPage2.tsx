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
  snapType?: 'vertex' | 'edge' | null;
  verifiedOnLine?: boolean;
}

const SnapPage2: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const lastSnapCoordRef = useRef<Coordinate | null>(null);
  const lastSnapTypeRef = useRef<'vertex' | 'edge' | null>(null);
  const clickSnapStatusRef = useRef<Array<{coord: Coordinate | null, snapType: 'vertex' | 'edge' | null}>>([]);

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
      // vertex가 있으면 꼭짓점 스냅, 없으면 선분(edge) 스냅
      lastSnapTypeRef.current = event.vertex ? 'vertex' : 'edge';
      console.log('Snap event - type:', lastSnapTypeRef.current, 'vertex:', event.vertex, 'edge:', event.coordinate);
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
          clickSnapStatusRef.current.push({
            coord: [...lastSnapCoordRef.current],
            snapType: lastSnapTypeRef.current
          });
          console.log('Click WITH snap:', lastSnapCoordRef.current, 'type:', lastSnapTypeRef.current);
          // 클릭 후 snap 정보 초기화 (다음 클릭을 위해)
          lastSnapCoordRef.current = null;
          lastSnapTypeRef.current = null;
        } else {
          clickSnapStatusRef.current.push({
            coord: null,
            snapType: null
          });
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
        const startSnapResult = checkIfSnapped(startPoint, firstClickSnap?.coord || null);
        const startVerified = firstClickSnap?.coord ? verifyPointOnExistingLines(startPoint) : false;
        detectedSnapPoints.push({
          type: 'start',
          coordinate: startPoint,
          isSnapped: startSnapResult,
          snapType: firstClickSnap?.snapType || null,
          verifiedOnLine: startVerified,
        });

        console.log(startSnapResult ? '✓ Start point is SNAPPED' : '✗ Start point is NOT snapped');
        console.log('Start point snap type:', firstClickSnap?.snapType);
        console.log('Start point verified on line:', startVerified);

        // Check end point
        const endSnapResult = checkIfSnapped(endPoint, lastClickSnap?.coord || null);
        const endVerified = lastClickSnap?.coord ? verifyPointOnExistingLines(endPoint) : false;
        detectedSnapPoints.push({
          type: 'end',
          coordinate: endPoint,
          isSnapped: endSnapResult,
          snapType: lastClickSnap?.snapType || null,
          verifiedOnLine: endVerified,
        });

        console.log(endSnapResult ? '✓ End point is SNAPPED' : '✗ End point is NOT snapped');
        console.log('End point snap type:', lastClickSnap?.snapType);
        console.log('End point verified on line:', endVerified);

        setSnapPoints(detectedSnapPoints);

        console.log('=== Final Results ===');
        console.log('Start point snapped:', startSnapResult);
        console.log('End point snapped:', endSnapResult);

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

  // Helper function to verify if a point is actually on existing lines
  const verifyPointOnExistingLines = (point: Coordinate): boolean => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return false;

    const features = vectorSource.getFeatures();
    const tolerance = 1; // 1 pixel tolerance

    for (const feature of features) {
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();

        // Check if point is on any vertex
        for (const coord of coordinates) {
          const distance = Math.sqrt(
            Math.pow(point[0] - coord[0], 2) +
            Math.pow(point[1] - coord[1], 2)
          );
          if (distance < tolerance) {
            console.log('Point verified on vertex:', coord);
            return true;
          }
        }

        // Check if point is on any edge
        for (let i = 0; i < coordinates.length - 1; i++) {
          const start = coordinates[i];
          const end = coordinates[i + 1];

          if (isPointOnSegment(point, start, end, tolerance)) {
            console.log('Point verified on edge between:', start, 'and', end);
            return true;
          }
        }
      }
    }

    console.log('Point NOT verified on any existing line');
    return false;
  };

  // Helper function to check if point is on a line segment
  const isPointOnSegment = (
    point: Coordinate,
    segmentStart: Coordinate,
    segmentEnd: Coordinate,
    tolerance: number
  ): boolean => {
    const [px, py] = point;
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;

    // Calculate distance from point to line segment
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < tolerance;
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
                    {snapInfo.snapType && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold">스냅 타입: </span>
                        <span className={snapInfo.snapType === 'vertex' ? 'text-blue-600' : 'text-purple-600'}>
                          {snapInfo.snapType === 'vertex' ? '꼭짓점' : '선분'}
                        </span>
                      </div>
                    )}
                    {snapInfo.verifiedOnLine !== undefined && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold">기존 선 위 검증: </span>
                        <span className={snapInfo.verifiedOnLine ? 'text-green-600' : 'text-red-600'}>
                          {snapInfo.verifiedOnLine ? '✓ 확인됨' : '✗ 확인 안됨'}
                        </span>
                      </div>
                    )}
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
