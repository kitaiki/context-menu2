import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { LineString, Point } from 'ol/geom';
import { Coordinate } from 'ol/coordinate';
import { Style, Circle, Fill, Stroke } from 'ol/style';
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
 * Point 정보를 나타내는 인터페이스
 */
interface PointInfo {
  id: string;
  coordinate: Coordinate;
  timestamp: number;
}

type DrawMode = 'LineString' | 'Point';

/**
 * SnapPage3에 Point 그리기 기능을 추가한 버전
 * LineString과 Point를 모두 그릴 수 있으며, Snap 기능이 적용됩니다
 */
const SnapPage4: React.FC = () => {
  // Refs: DOM 요소 및 OpenLayers 객체 참조
  const mapRef = useRef<HTMLDivElement>(null);  // 지도 컨테이너 DOM
  const mapInstanceRef = useRef<Map | null>(null);  // OpenLayers Map 인스턴스
  const vectorSourceRef = useRef<VectorSource | null>(null);  // 벡터 레이어 소스
  const drawRef = useRef<Draw | null>(null);  // Draw 인터랙션
  const snapRef = useRef<Snap | null>(null);  // Snap 인터랙션

  // LineString ID 카운터
  const lineIdCounterRef = useRef<number>(0);  // LineString에 부여할 ID 카운터
  // Point ID 카운터
  const pointIdCounterRef = useRef<number>(0);  // Point에 부여할 ID 카운터

  // State: 현재 스냅 상태 및 스냅 지점 정보
  const [snapped, setSnapped] = useState(false);  // 현재 스냅 중인지 여부
  const [snapPoints, setSnapPoints] = useState<SnapPointInfo[]>([]);  // 시작점/끝점 스냅 정보
  const [drawMode, setDrawMode] = useState<DrawMode>('LineString');  // 현재 그리기 모드
  const [points, setPoints] = useState<PointInfo[]>([]);  // 그려진 Point 목록

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
      style: (feature) => {
        const geometry = feature.getGeometry();

        // Point인 경우 파란색 원형 스타일
        if (geometry instanceof Point) {
          return new Style({
            image: new Circle({
              radius: 7,
              fill: new Fill({
                color: '#3399CC',
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 2,
              }),
            }),
          });
        }

        // LineString인 경우 노란색 선 스타일
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33',
            }),
          }),
        });
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

    // Snap 이벤트 리스너 - UI 표시용
    snap.on('snap', () => {
      setSnapped(true);
    });

    // 마우스 이동 시 스냅 상태 초기화 (UI 표시용)
    map.on('pointermove', () => {
      setSnapped(false);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  /**
   * Draw 인터랙션 설정 (drawMode에 따라 변경)
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

    // Draw 인터랙션 생성 (현재 모드에 따라)
    const draw = new Draw({
      source: vectorSource,
      type: drawMode,
    });

    // 드로우 시작 이벤트 - 상태 초기화
    draw.on('drawstart', () => {
      setSnapPoints([]);
      console.log(`=== ${drawMode} Draw Started ===`);
    });

    // 드로우 완료 이벤트
    draw.on('drawend', (event: DrawEvent) => {
      const geometry = event.feature.getGeometry();

      if (geometry instanceof LineString) {
        handleLineStringDrawEnd(event, geometry);
      } else if (geometry instanceof Point) {
        handlePointDrawEnd(event, geometry);
      }
    });

    // Draw 인터랙션을 지도에 추가
    map.addInteraction(draw);
    drawRef.current = draw;

    // Snap 인터랙션을 다시 추가하여 최상위에 위치시킨 (우선순위 보장)
    map.removeInteraction(snap);
    map.addInteraction(snap);
  }, [drawMode]);

  /**
   * LineString 그리기 완료 처리
   */
  const handleLineStringDrawEnd = (event: DrawEvent, geometry: LineString) => {
    // 새로운 LineString에 ID 부여
    const newLineId = `LINE_${++lineIdCounterRef.current}`;
    event.feature.setId(newLineId);
    console.log('🆔 New line created with ID:', newLineId);

    const coordinates = geometry.getCoordinates();
    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

    console.log('=== Draw End Analysis ===');
    console.log('Total coordinates:', coordinates.length);
    console.log('Start point:', startPoint);
    console.log('End point:', endPoint);

    const detectedSnapPoints: SnapPointInfo[] = [];

    // 시작점 검증 및 스냅된 선의 ID 찾기
    const startSnapInfo = verifyPointOnExistingLinesWithType(startPoint);
    const startSnappedLineId = startSnapInfo.lineId;

    detectedSnapPoints.push({
      type: 'start',
      coordinate: startPoint,
      isSnapped: startSnapInfo.isSnapped,
      snapType: startSnapInfo.snapType,
      verifiedOnLine: startSnapInfo.isSnapped,
      snappedLineId: startSnappedLineId,
    });

    console.log(startSnapInfo.isSnapped ? '✓ Start point is SNAPPED' : '✗ Start point is NOT snapped');
    console.log('Start point snap type:', startSnapInfo.snapType);
    if (startSnappedLineId) {
      console.log('🔗 Start point snapped to line:', startSnappedLineId);
    }

    // 끝점 검증 및 스냅된 선의 ID 찾기
    const endSnapInfo = verifyPointOnExistingLinesWithType(endPoint);
    const endSnappedLineId = endSnapInfo.lineId;

    detectedSnapPoints.push({
      type: 'end',
      coordinate: endPoint,
      isSnapped: endSnapInfo.isSnapped,
      snapType: endSnapInfo.snapType,
      verifiedOnLine: endSnapInfo.isSnapped,
      snappedLineId: endSnappedLineId,
    });

    console.log(endSnapInfo.isSnapped ? '✓ End point is SNAPPED' : '✗ End point is NOT snapped');
    console.log('End point snap type:', endSnapInfo.snapType);
    if (endSnappedLineId) {
      console.log('🔗 End point snapped to line:', endSnappedLineId);
    }

    // UI에 결과 표시
    setSnapPoints(detectedSnapPoints);

    console.log('=== Final Results ===');
    console.log('Start point snapped:', startSnapInfo.isSnapped);
    console.log('End point snapped:', endSnapInfo.isSnapped);
  };

  /**
   * Point 그리기 완료 처리
   */
  const handlePointDrawEnd = (event: DrawEvent, geometry: Point) => {
    // 새로운 Point에 ID 부여
    const newPointId = `POINT_${++pointIdCounterRef.current}`;
    event.feature.setId(newPointId);

    const coordinate = geometry.getCoordinates();
    console.log('🆔 New point created with ID:', newPointId);
    console.log('Point coordinate:', coordinate);

    // Point 정보 저장
    const newPointInfo: PointInfo = {
      id: newPointId,
      coordinate,
      timestamp: Date.now(),
    };

    setPoints(prev => [...prev, newPointInfo]);

    // Point가 기존 선 위에 있는지 검증
    const snapInfo = verifyPointOnExistingLinesWithType(coordinate);
    if (snapInfo.isSnapped) {
      console.log(`✓ Point ${newPointId} is snapped to ${snapInfo.lineId} (${snapInfo.snapType})`);
    } else {
      console.log(`✗ Point ${newPointId} is not snapped to any line`);
    }
  };

  /**
   * 점이 기존 선 위에 있는지 검증하고 스냅 타입 및 선 ID를 반환하는 개선된 함수
   * @param point 확인할 점의 좌표
   * @returns 스냅 여부, 타입, 선 ID 정보
   */
  const verifyPointOnExistingLinesWithType = (point: Coordinate): {
    isSnapped: boolean;
    snapType: 'vertex' | 'edge' | null;
    lineId: string | null;
  } => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return { isSnapped: false, snapType: null, lineId: null };

    const features = vectorSource.getFeatures();
    const tolerance = 1; // 1 픽셀 허용 오차

    // 모든 피처를 순회하며 검증
    for (const feature of features) {
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();

        // 1. 먼저 꼭짓점(vertex) 위에 있는지 확인
        for (const coord of coordinates) {
          const distance = Math.sqrt(
            Math.pow(point[0] - coord[0], 2) +
            Math.pow(point[1] - coord[1], 2)
          );
          if (distance < tolerance) {
            const lineId = feature.getId();
            console.log('Point verified on vertex:', coord);
            return {
              isSnapped: true,
              snapType: 'vertex',
              lineId: lineId ? String(lineId) : null
            };
          }
        }

        // 2. 꼭짓점이 아니면 선분(edge) 위에 있는지 확인
        for (let i = 0; i < coordinates.length - 1; i++) {
          const start = coordinates[i];
          const end = coordinates[i + 1];

          if (isPointOnSegment(point, start, end, tolerance)) {
            const lineId = feature.getId();
            console.log('Point verified on edge between:', start, 'and', end);
            return {
              isSnapped: true,
              snapType: 'edge',
              lineId: lineId ? String(lineId) : null
            };
          }
        }
      }
    }

    console.log('Point NOT verified on any existing line');
    return { isSnapped: false, snapType: null, lineId: null };
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

  /**
   * 모든 도형 삭제
   */
  const clearAll = () => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      setSnapPoints([]);
      setPoints([]);
      lineIdCounterRef.current = 0;
      pointIdCounterRef.current = 0;
      console.log('All features cleared');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Snap Page 4 - Point 그리기 기능 추가
        </h1>
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded">
          <p className="text-sm text-green-800">
            💡 <strong>새로운 기능:</strong> LineString뿐만 아니라 Point도 그릴 수 있습니다. Point는 기존 선에 스냅됩니다.
          </p>
        </div>

        {/* 그리기 모드 선택 */}
        <div className="mb-4 p-4 bg-white rounded border border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-3">그리기 모드 선택</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setDrawMode('LineString')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                drawMode === 'LineString'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📏 LineString
            </button>
            <button
              onClick={() => setDrawMode('Point')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                drawMode === 'Point'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📍 Point
            </button>
            <button
              onClick={clearAll}
              className="ml-auto px-4 py-2 rounded font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              🗑️ 모두 삭제
            </button>
          </div>
        </div>

        {/* 지도 컨테이너 */}
        <div
          ref={mapRef}
          id="map"
          className="w-full h-[400px] border border-gray-300 rounded-lg shadow-lg mb-4"
        />

        {/* 스냅 상태 표시 */}
        <div className="mb-4 p-3 bg-white rounded border border-gray-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Currently Snapping: <span className={snapped ? 'text-green-600' : 'text-red-600'}>{String(snapped)}</span>
            </span>
            <span className="text-sm text-gray-600">
              현재 모드: <span className="font-bold text-blue-600">{drawMode}</span>
            </span>
          </div>

          {/* Point 목록 표시 */}
          {points.length > 0 && (
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <h4 className="text-sm font-bold text-purple-900 mb-2">
                생성된 Point 목록 ({points.length}개)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {points.map((point) => (
                  <div
                    key={point.id}
                    className="text-xs p-2 bg-white rounded border border-purple-100"
                  >
                    <span className="font-mono font-bold text-indigo-600">{point.id}</span>
                    <span className="text-gray-600 ml-2">
                      X: {point.coordinate[0].toFixed(2)}, Y: {point.coordinate[1].toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LineString 스냅 결과 표시 */}
          {snapPoints.length > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2">
                LineString Snap Results (Verified at drawEnd)
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
                          {snapInfo.snapType === 'vertex' ? '꼭짓점 (Vertex)' : '선분 (Edge)'}
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
          <h3 className="font-bold text-blue-900 mb-2">사용 방법 및 특징</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 📏 LineString 모드: 선을 그려서 기존 선과 연결할 수 있습니다</li>
            <li>• 📍 Point 모드: 지도를 클릭하여 Point를 생성할 수 있습니다</li>
            <li>• Point는 기존 LineString에 자동으로 스냅됩니다</li>
            <li>• 각 LineString에 LINE_1, LINE_2 등 고유 ID가 자동으로 부여됩니다</li>
            <li>• 각 Point에 POINT_1, POINT_2 등 고유 ID가 자동으로 부여됩니다</li>
            <li>• vertex(꼭짓점)와 edge(선분) 스냅을 구분할 수 있습니다</li>
            <li>• 스냅된 경우 해당 선의 ID를 표시합니다</li>
            <li>• 모두 삭제 버튼으로 모든 도형을 제거할 수 있습니다</li>
          </ul>
        </div>

        {/* 비교 정보 */}
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">SnapPage3 vs SnapPage4 비교</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">SnapPage3</h4>
              <ul className="text-gray-700 space-y-1">
                <li>✅ LineString 그리기</li>
                <li>✅ Snap 기능</li>
                <li>✅ vertex/edge 구분</li>
                <li>❌ Point 그리기 없음</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">SnapPage4</h4>
              <ul className="text-gray-700 space-y-1">
                <li>✅ LineString 그리기</li>
                <li>✅ Point 그리기 추가</li>
                <li>✅ 모드 전환 기능</li>
                <li>✅ Point 목록 표시</li>
                <li>✅ 전체 삭제 기능</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapPage4;
