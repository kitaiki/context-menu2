import React, { useEffect, useRef, useState } from 'react';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import ContextMenu, { MenuItem } from './ContextMenu';
import 'ol/ol.css';
import {
  MdLocationOn, MdContentCopy, MdFlag, MdExplore,
  MdGpsFixed, MdZoomIn, MdZoomOut, MdBuild,
  MdStraighten, MdCrop, MdVisibility, MdSatellite,
  MdTerrain, MdMap
} from 'react-icons/md';

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
}


const MapComponent: React.FC<MapComponentProps> = ({
  center = [126.9780, 37.5665], // 서울 기본 좌표
  zoom = 13
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const mapClickHandlerRef = useRef<() => void>();
  const rightClickHandlerRef = useRef<(event: MouseEvent) => boolean | void>();
  
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>([0, 0]);


  // 컨텍스트 메뉴 처리 함수
  // 메뉴 구조 정의
  const menuItems: MenuItem[] = React.useMemo(() => [
    {
      id: 'location',
      label: '위치 정보',
      icon: <MdLocationOn />,
      submenu: [
        { id: 'info', label: '좌표 정보 보기', icon: <MdLocationOn />, action: 'info' },
        { id: 'copy-coords', label: '좌표 복사', icon: <MdContentCopy />, action: 'copy-coords' },
        { id: 'marker', label: '마커 추가', icon: <MdFlag />, action: 'add-marker' }
      ]
    },
    {
      id: 'navigation',
      label: '지도 탐색',
      icon: <MdExplore />,
      submenu: [
        { id: 'center', label: '이곳을 중심으로', icon: <MdGpsFixed />, action: 'center' },
        { id: 'zoom-in', label: '확대', icon: <MdZoomIn />, action: 'zoom-in' },
        { id: 'zoom-out', label: '축소', icon: <MdZoomOut />, action: 'zoom-out' }
      ]
    },
    {
      id: 'tools',
      label: '도구',
      icon: <MdBuild />,
      submenu: [
        { id: 'measure', label: '거리 측정', icon: <MdStraighten />, action: 'measure' },
        { id: 'area', label: '면적 측정', icon: <MdCrop />, action: 'area' }
      ]
    },
    {
      id: 'view',
      label: '보기 옵션',
      icon: <MdVisibility />,
      submenu: [
        { id: 'satellite', label: '위성 지도', icon: <MdSatellite />, action: 'satellite' },
        { id: 'terrain', label: '지형 지도', icon: <MdTerrain />, action: 'terrain' },
        { id: 'street', label: '도로 지도', icon: <MdMap />, action: 'street' }
      ]
    }
  ], []);

  const hideContextMenu = React.useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  const handleContextMenuAction = React.useCallback((action: string, coordinate: [number, number]) => {
    const lonLat = toLonLat(coordinate);

    switch (action) {
      case 'info':
        alert(`좌표 정보:\n경도: ${lonLat[0].toFixed(6)}\n위도: ${lonLat[1].toFixed(6)}`);
        break;
      case 'copy-coords':
        const coordText = `${lonLat[1].toFixed(6)}, ${lonLat[0].toFixed(6)}`;
        navigator.clipboard.writeText(coordText).then(() => {
          alert('좌표가 클립보드에 복사되었습니다!');
        });
        break;
      case 'add-marker':
        alert('마커 추가 기능은 추후 구현 예정입니다.');
        break;
      case 'zoom-in':
        if (mapInstanceRef.current) {
          const view = mapInstanceRef.current.getView();
          view.setCenter(coordinate);
          view.setZoom((view.getZoom() || 13) + 1);
        }
        break;
      case 'zoom-out':
        if (mapInstanceRef.current) {
          const view = mapInstanceRef.current.getView();
          view.setCenter(coordinate);
          view.setZoom((view.getZoom() || 13) - 1);
        }
        break;
      case 'center':
        if (mapInstanceRef.current) {
          const view = mapInstanceRef.current.getView();
          view.setCenter(coordinate);
        }
        break;
      case 'measure':
        alert('거리 측정 기능은 추후 구현 예정입니다.');
        break;
      case 'area':
        alert('면적 측정 기능은 추후 구현 예정입니다.');
        break;
      case 'satellite':
        alert('위성 지도 보기 기능은 추후 구현 예정입니다.');
        break;
      case 'terrain':
        alert('지형 지도 보기 기능은 추후 구현 예정입니다.');
        break;
      case 'street':
        alert('도로 지도가 기본 보기입니다.');
        break;
    }
    hideContextMenu();
  }, [hideContextMenu]);

  // 오른쪽 클릭 이벤트 핸들러
  const handleRightClick = React.useCallback((event: MouseEvent) => {
    // 모든 기본 동작 및 이벤트 전파 차단
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!mapInstanceRef.current) return false;

    // 마우스 좌표를 지도 좌표로 변환
    const map = mapInstanceRef.current;
    const mapElement = map.getTargetElement();

    if (!mapElement) return false;

    const rect = mapElement.getBoundingClientRect();
    const pixel = [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
    const coordinate = map.getCoordinateFromPixel(pixel);

    if (coordinate) {
      setContextMenuPosition([coordinate[0], coordinate[1]]);
      setContextMenuVisible(true);

      // overlay 위치 설정
      if (overlayRef.current && coordinate) {
        overlayRef.current.setPosition(coordinate);
      }
    }

    return false;
  }, []);

  // 클릭 이벤트 핸들러
  const handleMapClick = React.useCallback(() => {
    // 컨텍스트 메뉴가 열려있으면 닫기
    if (contextMenuVisible) {
      hideContextMenu();
    }
  }, [contextMenuVisible, hideContextMenu]);

  // 안정적인 핸들러 참조 업데이트
  useEffect(() => {
    mapClickHandlerRef.current = handleMapClick;
    rightClickHandlerRef.current = handleRightClick;
  });

  useEffect(() => {
    if (!mapRef.current) return;

    // OSM 타일 레이어 생성
    const osmLayer = new TileLayer({
      source: new OSM()
    });

    // 지도 뷰 설정
    const view = new View({
      center: fromLonLat(center),
      zoom: zoom,
      minZoom: 3,
      maxZoom: 20
    });

    // 컨텍스트 메뉴 overlay 생성
    const overlay = new Overlay({
      autoPan: true,
      positioning: 'top-left',
      offset: [0, 0]
    });

    overlayRef.current = overlay;

    // 지도 인스턴스 생성
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer],
      view: view,
      overlays: [overlay]
    });

    mapInstanceRef.current = map;



    // 지도 이벤트 리스너 등록 (안정적인 참조 사용)
    const stableMapClickHandler = () => {
      if (mapClickHandlerRef.current) {
        mapClickHandlerRef.current();
      }
    };

    const stableRightClickHandler = (event: MouseEvent) => {
      if (rightClickHandlerRef.current) {
        return rightClickHandlerRef.current(event);
      }
      return false;
    };

    map.on('click', stableMapClickHandler);

    // 오른쪽 클릭 이벤트 리스너 등록 (캐처링 단계에서 처리)
    const viewport = map.getViewport();
    viewport.addEventListener('contextmenu', stableRightClickHandler, { capture: true, passive: false });


    // 지도 로드 완료 이벤트
    map.once('loadend', () => {
      console.log('OpenLayers 지도가 성공적으로 로드되었습니다.');
    });

    // 클린업
    return () => {
      const cleanupViewport = map.getViewport();
      cleanupViewport.removeEventListener('contextmenu', stableRightClickHandler, { capture: true } as any);
      map.setTarget(undefined);
    };
  }, [center, zoom]);



  return (
    <div className="map-container">
        {/* 지도 */}
        <div
          ref={mapRef}
          className="map-view"
        />

      {/* 컨텍스트 메뉴 */}
      <ContextMenu
        visible={contextMenuVisible}
        position={contextMenuPosition}
        menuItems={menuItems}
        onAction={handleContextMenuAction}
        onHide={hideContextMenu}
        overlay={overlayRef.current || undefined}
      />


      <style>{`
        .map-container {
          width: 100vw;
          height: 100vh;
          padding: 0;
          margin: 0;
          position: relative;
        }

        .map-view {
          width: 100%;
          height: 100%;
          border: none;
        }










      `}</style>
    </div>
  );
};

export default MapComponent;