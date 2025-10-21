import React, { useState } from 'react';
import { Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LaneInfo {
  bits: number[];
  angle: number;
  outLinkId: number;
}

interface LaneDirection {
  laneNumber: number;
  angles: number[];
  outLinkIds: number[];
}

// Sortable Lane Item 컴포넌트
const SortableLaneItem: React.FC<{ lane: LaneDirection; selectedOutLinkId: number | null; setSelectedOutLinkId: (id: number | null) => void }> = ({ lane, selectedOutLinkId, setSelectedOutLinkId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lane.laneNumber });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isHighlighted = selectedOutLinkId !== null && lane.outLinkIds.includes(selectedOutLinkId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-20 flex flex-col items-center border-r border-gray-200 last:border-r-0 cursor-grab active:cursor-grabbing ${
        isHighlighted ? 'bg-purple-50' : 'bg-gray-600'
      } ${isDragging ? 'z-50' : ''}`}
      onClick={() => {
        if (lane.outLinkIds.length > 0) {
          setSelectedOutLinkId(lane.outLinkIds[0]);
        }
      }}
    >
      {/* 차선 번호 레이블 */}
      <div className="w-full py-1 text-center bg-gray-700 border-b border-gray-500">
        <span className="text-xs font-bold text-white">{lane.laneNumber}차선</span>
      </div>

      {/* 화살표 이미지 영역 */}
      <div className="flex-1 flex items-center justify-center relative w-full px-2 py-4">
        {lane.angles.map((angle, index) => (
          <img
            key={`${lane.laneNumber}-${angle}-${index}`}
            src={`/src/arrows/${angle}.png`}
            alt={`angle-${angle}`}
            className="absolute w-12 h-12 object-contain"
            style={{
              zIndex: lane.angles.length - index,
              opacity: index === 0 ? 1 : 0.8,
              filter: 'brightness(0) invert(1)'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Lane: React.FC = () => {
  const [selectedOutLinkId, setSelectedOutLinkId] = useState<number | null>(null);

  // 차선 정보 데이터 (상태로 관리)
  const [laneInfo, setLaneInfo] = useState<LaneInfo[]>([
    { bits: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0], angle: 1, outLinkId: 1111 },
    { bits: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], angle: 10, outLinkId: 2222 },
    { bits: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], angle: 7, outLinkId: 3333 },
    { bits: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], angle: 4, outLinkId: 4444 },
    { bits: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], angle: 1, outLinkId: 5555 }
  ]);

  // 차선별 방향 정보 계산 (각도별로 그룹핑)
  const getLaneDirections = () => {
    const laneMap: {
      [key: number]: { angles: number[]; outLinkIds: number[] };
    } = {};

    laneInfo.forEach((info) => {
      info.bits.forEach((bit, index) => {
        if (bit === 1) {
          const laneNumber = index + 1;
          if (!laneMap[laneNumber]) {
            laneMap[laneNumber] = { angles: [], outLinkIds: [] };
          }
          laneMap[laneNumber].angles.push(info.angle);
          laneMap[laneNumber].outLinkIds.push(info.outLinkId);
        }
      });
    });

    return Object.entries(laneMap)
      .map(([lane, data]) => ({
        laneNumber: parseInt(lane),
        angles: data.angles,
        outLinkIds: data.outLinkIds
      }))
      .sort((a, b) => a.laneNumber - b.laneNumber);
  };

  const [laneDirections, setLaneDirections] = useState<LaneDirection[]>([]);

  // laneInfo가 변경될 때마다 laneDirections 업데이트
  React.useEffect(() => {
    setLaneDirections(getLaneDirections());
  }, [laneInfo]);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLaneDirections((items) => {
        const oldIndex = items.findIndex((item) => item.laneNumber === active.id);
        const newIndex = items.findIndex((item) => item.laneNumber === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 차선 추가 기능
  const handleAddLane = () => {
    // 우측 차선이 있는지 확인 (angle 3, 4, 5)
    const hasRightLane = laneInfo.some(info =>
      info.angle === 3 || info.angle === 4 || info.angle === 5
    );

    setLaneInfo(prevLaneInfo => {
      return prevLaneInfo.map(info => {
        const newBits = [...info.bits];
        const isRightLane = info.angle === 3 || info.angle === 4 || info.angle === 5;

        if (hasRightLane && isRightLane) {
          // 우측 차선인 경우: 오른쪽으로 한 칸 이동 (shift right)
          const oneIndices: number[] = [];
          newBits.forEach((bit, idx) => {
            if (bit === 1) oneIndices.push(idx);
          });

          // 기존 1을 모두 0으로
          for (let i = 0; i < newBits.length; i++) {
            newBits[i] = 0;
          }

          // 한 칸 오른쪽으로 이동
          oneIndices.forEach(idx => {
            if (idx + 1 < newBits.length) {
              newBits[idx + 1] = 1;
            }
          });
        } else if (!isRightLane) {
          // 우측 차선이 아닌 경우: 오른쪽에 차선 추가
          const lastOneIndex = newBits.lastIndexOf(1);
          if (lastOneIndex >= 0 && lastOneIndex < newBits.length - 1) {
            newBits[lastOneIndex + 1] = 1;
          }
        }

        return { ...info, bits: newBits };
      });
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* 차선정보 카드 - 전체 600px x 460px */}
      <div className="w-[600px] bg-white rounded-lg shadow-lg border border-gray-300">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-gray-300 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">차선정보</h2>
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xl">🏠</span>
          </div>
        </div>

        {/* 메인 컨텐츠 영역 - 2단 레이아웃 */}
        <div className="flex h-[360px]">

          {/* 왼쪽: 레인 설정 영역 - 200px */}
          <div className="w-[200px] border-r border-gray-300 p-4 flex flex-col">

            {/* IN LINK ID */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">IN LINK ID</label>
              <Select
                defaultValue="1111"
                className="w-full"
                options={[
                  { value: '1111', label: '1111' },
                  { value: '2222', label: '2222' },
                  { value: '3333', label: '3333' },
                  { value: '4444', label: '4444' },
                  { value: '5555', label: '5555' },
                ]}
              />
            </div>

            {/* 안내코드 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">안내코드</label>
              <Select
                defaultValue="안내없음"
                className="w-full"
                options={[
                  { value: '안내없음', label: '안내없음' }
                ]}
              />
            </div>

            {/* 본선차선수 */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">본선차선수</label>
              <input
                type="number"
                defaultValue={2}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* 부가차선 */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">부가차선</label>
              <div className="text-sm text-gray-600">좌측: 1 우측: 1</div>
            </div>

            {/* 정방향/역방향 라디오 버튼 */}
            <div className="flex gap-4 mt-auto mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="direction" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-gray-700">정방향</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="direction" className="w-4 h-4" />
                <span className="text-sm text-blue-600 font-semibold">역방향</span>
              </label>
            </div>
          </div>

          {/* 오른쪽: 부가차선 영역 - 400px */}
          <div className="w-[400px] flex flex-col">

            {/* 부가차선 헤더 */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-300">
              <h3 className="text-sm font-semibold text-gray-700">부가차선</h3>
            </div>

            {/* 차선 표시 영역 */}
            <div className="flex flex-1">

              {/* 차선 그리기 영역 - 스크롤 가능 */}
              <div className="flex-1 overflow-x-auto">
                {/* 체크박스 영역 */}
                <div className="flex min-w-max px-2 py-2 border-b border-gray-200">
                  {laneDirections.map((lane) => (
                    <div key={`checkbox-${lane.laneNumber}`} className="w-20 flex items-center justify-center border-r border-gray-200 last:border-r-0">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="w-4 h-4" />
                      </label>
                    </div>
                  ))}
                </div>

                {/* 차선 영역 - 드래그 앤 드롭 적용 */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={laneDirections.map((lane) => lane.laneNumber)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex h-[calc(100%-40px)] min-w-max px-2">
                      {laneDirections.map((lane) => (
                        <SortableLaneItem
                          key={lane.laneNumber}
                          lane={lane}
                          selectedOutLinkId={selectedOutLinkId}
                          setSelectedOutLinkId={setSelectedOutLinkId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* +버튼 영역 - 80px */}
              <div className="w-20 flex items-center justify-center bg-white border-l border-gray-300">
                <button
                  onClick={handleAddLane}
                  className="w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-600 transition flex items-center justify-center group"
                >
                  <PlusOutlined className="text-white text-2xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 정보 영역 */}
        <div className="flex border-t border-gray-300 text-xs">
          {/* 왼쪽 */}
          <div className="w-[200px] p-3 border-r border-gray-300 space-y-1">
            <div className="text-gray-600">
              <span className="font-semibold">입력인원:</span> 홍길동
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">수정인원:</span> 홍길동
            </div>
          </div>
          {/* 중앙 */}
          <div className="flex-1 p-3 border-r border-gray-300 space-y-1">
            <div className="text-gray-600">
              <span className="font-semibold">입력시간:</span> 2025.10.16 12:20:11
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">수정인원:</span> 2025.10.16 12:20:11
            </div>
          </div>
          {/* 오른쪽 */}
          <div className="w-20 flex items-center justify-center">
            <button className="px-4 py-1.5 bg-white border border-gray-400 rounded text-sm hover:bg-gray-50 transition">
              저장
            </button>
          </div>
        </div>

        {/* 디버깅 영역 */}
        <div className="p-4 bg-gray-50 border-t border-gray-300 space-y-3">
          {/* laneInfo 데이터 표시 */}
          <div className="bg-white p-3 rounded border border-gray-300">
            <h4 className="text-xs font-bold text-gray-800 mb-2">현재 laneInfo 데이터:</h4>
            <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono">
              {JSON.stringify(laneInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lane;
