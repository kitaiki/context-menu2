import React, { useState } from 'react';
import { Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface LaneInfo {
  bits: number[];
  angle: number;
  outLinkId: number;
}

const Lane: React.FC = () => {
  const [selectedOutLinkId, setSelectedOutLinkId] = useState<number | null>(null);

  // 차선 정보 데이터
  const laneInfo: LaneInfo[] = [
    { bits: [0, 1, 1, 1, 0], angle: 1, outLinkId: 1111 },
    { bits: [1, 0, 0, 0, 0], angle: 10, outLinkId: 2222 },
    { bits: [1, 0, 0, 0, 0], angle: 7, outLinkId: 3333 },
    { bits: [0, 0, 0, 0, 1], angle: 4, outLinkId: 4444 },
    { bits: [0, 0, 0, 0, 1], angle: 1, outLinkId: 5555 }
  ];

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

  const laneDirections = getLaneDirections();

  // 특정 outLinkId가 포함된 차선인지 확인
  const isLaneHighlighted = (outLinkIds: number[]): boolean => {
    return selectedOutLinkId !== null && outLinkIds.includes(selectedOutLinkId);
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

                {/* 차선 영역 */}
                <div className="flex h-[calc(100%-40px)] min-w-max px-2">
                  {laneDirections.map((lane) => {
                    const isHighlighted = isLaneHighlighted(lane.outLinkIds);
                    return (
                      <div
                        key={lane.laneNumber}
                        className={`w-20 flex flex-col items-center border-r border-gray-200 last:border-r-0 transition-all cursor-pointer ${
                          isHighlighted ? 'bg-purple-50' : 'bg-gray-600'
                        }`}
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
                  })}
                </div>
              </div>

              {/* +버튼 영역 - 80px */}
              <div className="w-20 flex items-center justify-center bg-white border-l border-gray-300">
                <button className="w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-600 transition flex items-center justify-center group">
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

        {/* 디버깅: OutLinkId 선택 */}
        <div className="p-4 bg-gray-50 border-t border-gray-300">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-700">디버깅 - OutLinkId 선택:</span>
            <button
              onClick={() => setSelectedOutLinkId(null)}
              className={`px-3 py-1 text-xs rounded ${
                selectedOutLinkId === null
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            {[...new Set(laneInfo.map(info => info.outLinkId))].map((outLinkId) => (
              <button
                key={outLinkId}
                onClick={() => setSelectedOutLinkId(outLinkId)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedOutLinkId === outLinkId
                    ? 'bg-purple-500 text-white font-bold'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {outLinkId}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lane;
