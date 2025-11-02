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

/**
 * 스냅된 지점의 정보를 나타내는 인터페이스
 */
interface SnapPointInfo {
  type: 'start' | 'end';  // 시작점 또는 끝점
  coordinate: Coordinate;  // 좌표
  isSnapped: boolean;  // 스냅 여부
  snapType?: 'vertex' | 'edge' | null;  // 스냅 타입 (꼭짓점 또는 선분)
  verifiedOnLine?: boolean;  // 기존 선 위에 있는지 검증 여부
  snappedLineId?: string | null;  // 스냅된 선의 ID
}

/**
 * LineString의 시작점과 끝점만 스냅 여부를 검증하는 컴포넌트
 */
const SnapPage2: React.FC = () => {
  // Refs: DOM 요소 및 OpenLayers 객체 참조
  const mapRef = useRef<HTMLDivElement>(null);  // 지도 컨테이너 DOM
  const mapInstanceRef = useRef<Map | null>(null);  // OpenLayers Map 인스턴스
  const vectorSourceRef = useRef<VectorSource | null>(null);  // 벡터 레이어 소스
  const drawRef = useRef<Draw | null>(null);  // Draw 인터랙션
  const snapRef = useRef<Snap | null>(null);  // Snap 인터랙션

  // Snap 상태 추적을 위한 Refs
  const lastSnapCoordRef = useRef<Coordinate | null>(null);  // 마지막 스냅 좌표
  const lastSnapTypeRef = useRef<'vertex' | 'edge' | null>(null);  // 마지막 스냅 타입
  const clickSnapStatusRef = useRef<Array<{coord: Coordinate | null, snapType: 'vertex' | 'edge' | null}>>([]);  // 클릭 시 스냅 상태 기록

  // LineString ID 카운터
  const lineIdCounterRef = useRef<number>(0);  // LineString에 부여할 ID 카운터

  // State: 현재 스냅 상태 및 스냅 지점 정보
  const [snapped, setSnapped] = useState(false);  // 현재 스냅 중인지 여부
  const [snapPoints, setSnapPoints] = useState<SnapPointInfo[]>([]);  // 시작점/끝점 스냅 정보

  /**
   * 지도 초기화 및 Snap 인터랙션 설정
   */
  useEffect(() => {
    if (!mapRef.current) return;

    // 벡터 소스 생성 (그려진 도형들을 저장)
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // 배경 지도 레이어 (OpenStreetMap)
    const raster = new TileLayer({
      source: new OSM(),
    });

    // 벡터 레이어 (사용자가 그린 도형을 표시)
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

    // 지도 객체 생성
    const map = new Map({
      layers: [raster, vector],
      target: mapRef.current,
      view: new View({
        center: [-11000000, 4600000],  // 미국 중심부 좌표
        zoom: 4,
      }),
    });

    mapInstanceRef.current = map;

    // Snap 인터랙션 추가 (기존 도형에 자동으로 붙는 기능)
    const snap = new Snap({
      source: vectorSource,
    });
    map.addInteraction(snap);
    snapRef.current = snap;

    // Snap 이벤트 리스너 - 스냅이 발생할 때 호출됨
    snap.on('snap', (event: any) => {
      setSnapped(true);
      const coord = event.vertex || event.coordinate;
      lastSnapCoordRef.current = coord;
      // vertex가 있으면 꼭짓점 스냅, 없으면 선분(edge) 스냅
      lastSnapTypeRef.current = event.vertex ? 'vertex' : 'edge';
      console.log('Snap event - type:', lastSnapTypeRef.current, 'vertex:', event.vertex, 'edge:', event.coordinate);
    });

    // 마우스 이동 시 스냅 상태 초기화 (UI 표시용)
    map.on('pointermove', () => {
      setSnapped(false);
      // pointermove에서 snap 정보를 초기화하지 않음
      // 클릭할 때까지 마지막 snap 정보를 유지하여 타이밍 문제 방지
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  /**
   * Draw 인터랙션 설정 및 클릭/드로우 이벤트 처리
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    const vectorSource = vectorSourceRef.current;
    const snap = snapRef.current;
    if (!map || !vectorSource || !snap) return;

    // 기존 Draw 인터랙션이 있으면 제거
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    // Draw 인터랙션 생성 (LineString 그리기)
    const draw = new Draw({
      source: vectorSource,
      type: 'LineString',
    });

    // 드로우 시작 이벤트 - 상태 초기화
    draw.on('drawstart', () => {
      setSnapPoints([]);
      clickSnapStatusRef.current = [];
      console.log('=== Draw Started ===');
    });

    // 드로우 취소 이벤트 - 클릭 기록 초기화
    draw.on('drawabort', () => {
      clickSnapStatusRef.current = [];
    });

    // 지도 클릭 이벤트 - 각 클릭 시점의 스냅 상태를 기록
    map.on('click', () => {
      if (drawRef.current) {
        // 스냅 좌표가 있으면 저장, 없으면 null 저장
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

    // 드로우 완료 이벤트 - 시작점과 끝점의 스냅 여부 검증
    draw.on('drawend', (event: DrawEvent) => {
      const geometry = event.feature.getGeometry();

      if (geometry instanceof LineString) {
        // 새로운 LineString에 ID 부여
        const newLineId = `LINE_${++lineIdCounterRef.current}`;
        event.feature.setId(newLineId);
        console.log('🆔 New line created with ID:', newLineId);

        const coordinates = geometry.getCoordinates();
        const startPoint = coordinates[0];
        const endPoint = coordinates[coordinates.length - 1];

        console.log('=== Draw End Analysis ===');
        console.log('Total coordinates:', coordinates.length);
        console.log('Total clicks recorded:', clickSnapStatusRef.current.length);
        console.log('Start point:', startPoint);
        console.log('End point:', endPoint);

        const detectedSnapPoints: SnapPointInfo[] = [];

        // 첫 번째와 마지막 클릭 시점의 스냅 상태 가져오기
        const firstClickSnap = clickSnapStatusRef.current[0];
        const lastClickSnap = clickSnapStatusRef.current[clickSnapStatusRef.current.length - 1];

        // 시작점 스냅 검증 및 스냅된 선의 ID 찾기
        const startSnapResult = checkIfSnapped(startPoint, firstClickSnap?.coord || null);
        const startVerified = firstClickSnap?.coord ? verifyPointOnExistingLines(startPoint) : false;
        const startSnappedLineId = startVerified ? findSnappedLineId(startPoint) : null;

        detectedSnapPoints.push({
          type: 'start',
          coordinate: startPoint,
          isSnapped: startSnapResult,
          snapType: firstClickSnap?.snapType || null,
          verifiedOnLine: startVerified,
          snappedLineId: startSnappedLineId,
        });

        console.log(startSnapResult ? '✓ Start point is SNAPPED' : '✗ Start point is NOT snapped');
        console.log('Start point snap type:', firstClickSnap?.snapType);
        console.log('Start point verified on line:', startVerified);
        if (startSnappedLineId) {
          console.log('🔗 Start point snapped to line:', startSnappedLineId);
        }

        // 끝점 스냅 검증 및 스냅된 선의 ID 찾기
        const endSnapResult = checkIfSnapped(endPoint, lastClickSnap?.coord || null);
        const endVerified = lastClickSnap?.coord ? verifyPointOnExistingLines(endPoint) : false;
        const endSnappedLineId = endVerified ? findSnappedLineId(endPoint) : null;

        detectedSnapPoints.push({
          type: 'end',
          coordinate: endPoint,
          isSnapped: endSnapResult,
          snapType: lastClickSnap?.snapType || null,
          verifiedOnLine: endVerified,
          snappedLineId: endSnappedLineId,
        });

        console.log(endSnapResult ? '✓ End point is SNAPPED' : '✗ End point is NOT snapped');
        console.log('End point snap type:', lastClickSnap?.snapType);
        console.log('End point verified on line:', endVerified);
        if (endSnappedLineId) {
          console.log('🔗 End point snapped to line:', endSnappedLineId);
        }

        // UI에 결과 표시
        setSnapPoints(detectedSnapPoints);

        console.log('=== Final Results ===');
        console.log('Start point snapped:', startSnapResult);
        console.log('End point snapped:', endSnapResult);

        // 다음 드로우를 위해 클릭 기록 초기화
        clickSnapStatusRef.current = [];
      }
    });

    // Draw 인터랙션을 지도에 추가
    map.addInteraction(draw);
    drawRef.current = draw;

    // Snap 인터랙션을 다시 추가하여 최상위에 위치시킴 (우선순위 보장)
    map.removeInteraction(snap);
    map.addInteraction(snap);
  }, []);

  /**
   * 좌표가 스냅되었는지 확인하는 헬퍼 함수
   * @param coord 확인할 좌표
   * @param snapCoord 스냅된 좌표 (없으면 null)
   * @returns 스냅 여부 (1 픽셀 이내면 true)
   */
  const checkIfSnapped = (coord: Coordinate, snapCoord: Coordinate | null): boolean => {
    if (!snapCoord) return false;

    // 유클리드 거리 계산
    const distance = Math.sqrt(
      Math.pow(coord[0] - snapCoord[0], 2) +
      Math.pow(coord[1] - snapCoord[1], 2)
    );

    // 1 픽셀 이내면 스냅된 것으로 간주
    return distance < 1;
  };

  /**
   * 점이 실제로 기존 선 위에 있는지 검증하는 헬퍼 함수
   * @param point 확인할 점의 좌표
   * @returns 기존 선 위에 있으면 true
   */
  const verifyPointOnExistingLines = (point: Coordinate): boolean => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return false;

    const features = vectorSource.getFeatures();
    const tolerance = 1; // 1 픽셀 허용 오차

    // 모든 피처를 순회하며 검증
    for (const feature of features) {
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();

        // 꼭짓점(vertex) 위에 있는지 확인
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

        // 선분(edge) 위에 있는지 확인
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

  /**
   * 점이 스냅된 선의 ID를 찾는 헬퍼 함수
   * @param point 확인할 점의 좌표
   * @returns 스냅된 선의 ID 또는 null
   */
  const findSnappedLineId = (point: Coordinate): string | null => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return null;

    const features = vectorSource.getFeatures();
    const tolerance = 1; // 1 픽셀 허용 오차

    // 모든 피처를 순회하며 해당 점이 속한 선 찾기
    for (const feature of features) {
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();

        // 꼭짓점(vertex) 위에 있는지 확인
        for (const coord of coordinates) {
          const distance = Math.sqrt(
            Math.pow(point[0] - coord[0], 2) +
            Math.pow(point[1] - coord[1], 2)
          );
          if (distance < tolerance) {
            const lineId = feature.getId();
            return lineId ? String(lineId) : null;
          }
        }

        // 선분(edge) 위에 있는지 확인
        for (let i = 0; i < coordinates.length - 1; i++) {
          const start = coordinates[i];
          const end = coordinates[i + 1];

          if (isPointOnSegment(point, start, end, tolerance)) {
            const lineId = feature.getId();
            return lineId ? String(lineId) : null;
          }
        }
      }
    }

    return null;
  };

  /**
   * 점이 선분 위에 있는지 확인하는 헬퍼 함수
   * @param point 확인할 점
   * @param segmentStart 선분의 시작점
   * @param segmentEnd 선분의 끝점
   * @param tolerance 허용 오차 (픽셀)
   * @returns 점이 선분 위에 있으면 true
   */
  const isPointOnSegment = (
    point: Coordinate,
    segmentStart: Coordinate,
    segmentEnd: Coordinate,
    tolerance: number
  ): boolean => {
    const [px, py] = point;
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;

    // 점에서 선분까지의 거리 계산
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    // 선분 위의 가장 가까운 점 찾기
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      // 선분 시작점이 가장 가까움
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      // 선분 끝점이 가장 가까움
      xx = x2;
      yy = y2;
    } else {
      // 선분 위의 점이 가장 가까움
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    // 점과 선분 사이의 거리 계산
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

        {/* 지도 컨테이너 */}
        <div
          ref={mapRef}
          id="map"
          className="w-full h-[400px] border border-gray-300 rounded-lg shadow-lg mb-4"
        />

        {/* 스냅 상태 표시 */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-300 space-y-3">
          <div>
            <span className="font-semibold">
              Currently Snapping: <span className={snapped ? 'text-green-600' : 'text-red-600'}>{String(snapped)}</span>
            </span>
          </div>

          {/* 스냅 결과 표시 */}
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
                    {/* 시작점/끝점 및 스냅 여부 */}
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
                    {/* 스냅 타입 (꼭짓점 또는 선분) */}
                    {snapInfo.snapType && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold">스냅 타입: </span>
                        <span className={snapInfo.snapType === 'vertex' ? 'text-blue-600' : 'text-purple-600'}>
                          {snapInfo.snapType === 'vertex' ? '꼭짓점' : '선분'}
                        </span>
                      </div>
                    )}
                    {/* 기존 선 위 검증 결과 */}
                    {snapInfo.verifiedOnLine !== undefined && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold">기존 선 위 검증: </span>
                        <span className={snapInfo.verifiedOnLine ? 'text-green-600' : 'text-red-600'}>
                          {snapInfo.verifiedOnLine ? '✓ 확인됨' : '✗ 확인 안됨'}
                        </span>
                      </div>
                    )}
                    {/* 스냅된 선의 ID */}
                    {snapInfo.snappedLineId && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold">🔗 스냅된 선 ID: </span>
                        <span className="text-indigo-600 font-mono font-bold">
                          {snapInfo.snappedLineId}
                        </span>
                      </div>
                    )}
                    {/* 좌표 정보 */}
                    <div className="text-gray-700 font-mono text-[10px]">
                      X: {snapInfo.coordinate[0].toFixed(2)}, Y: {snapInfo.coordinate[1].toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 사용 방법 안내 */}
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
