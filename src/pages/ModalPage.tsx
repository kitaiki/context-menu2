import React, { useState } from 'react';

const ModalPage: React.FC = () => {
  const [mainLaneCount, setMainLaneCount] = useState(3);
  const [leftSubLaneCount, setLeftSubLaneCount] = useState(1);
  const [rightSubLaneCount, setRightSubLaneCount] = useState(1);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      <div className="w-[500px] h-[500px] bg-gray-200 relative grid grid-cols-[200px_300px] grid-rows-[40px_1fr_50px] border-2 border-gray-800 shadow-lg">
        {/* 상단 헤더 */}
        <div className="col-span-2 bg-gray-400 border-b-2 border-gray-600 flex items-center px-4">
          <span className="text-sm font-bold text-gray-800">5번지</span>
        </div>

        {/* 왼쪽 패널 */}
        <div className="bg-gray-300 border-r border-gray-600 p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-gray-600 font-bold">본선차선수</div>
            <input
              type="number"
              className="text-xs text-black px-1.5 py-1 bg-white border border-gray-400 rounded w-full"
              value={mainLaneCount}
              onChange={(e) => setMainLaneCount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-gray-600 font-bold">왼쪽부가차선수</div>
            <input
              type="number"
              className="text-xs text-black px-1.5 py-1 bg-white border border-gray-400 rounded w-full"
              value={leftSubLaneCount}
              onChange={(e) => setLeftSubLaneCount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-gray-600 font-bold">오른쪽부가차선수</div>
            <input
              type="number"
              className="text-xs text-black px-1.5 py-1 bg-white border border-gray-400 rounded w-full"
              value={rightSubLaneCount}
              onChange={(e) => setRightSubLaneCount(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-gray-600 font-bold">출발지</div>
            <div className="text-xs text-black px-1.5 py-1 bg-gray-100 border border-gray-400 rounded">
              대전시
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-gray-600 font-bold">도착지</div>
            <div className="text-xs text-black px-1.5 py-1 bg-gray-100 border border-gray-400 rounded">
              서울시
            </div>
          </div>
        </div>

        {/* 오른쪽 도로 영역 */}
        <div className="bg-gray-400 relative flex flex-col border-l border-gray-600">
          {/* 차선 그리기 영역 */}
          <div className="flex-1 bg-gradient-to-b from-gray-400 to-gray-500 border border-dashed border-gray-600 m-2.5 mt-2.5 mb-0 relative overflow-x-auto overflow-y-hidden">
            <div className="flex h-full p-2.5 gap-0.5">
              {/* 왼쪽 부가차선 */}
              {Array.from({ length: leftSubLaneCount }).map((_, index) => (
                <div
                  key={`left-${index}`}
                  className="w-[100px] flex-shrink-0 h-full relative flex flex-col items-center pt-2.5 bg-gray-600/30 border-2 border-dashed border-gray-700"
                >
                  <div className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    좌부가{index + 1}
                  </div>
                </div>
              ))}

              {/* 본선 */}
              {Array.from({ length: mainLaneCount }).map((_, index) => (
                <div
                  key={`main-${index}`}
                  className="w-[100px] flex-shrink-0 h-full relative flex flex-col items-center pt-2.5 bg-gray-700/30 border-2 border-solid border-gray-700"
                >
                  <div className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    본선{index + 1}
                  </div>
                </div>
              ))}

              {/* 오른쪽 부가차선 */}
              {Array.from({ length: rightSubLaneCount }).map((_, index) => (
                <div
                  key={`right-${index}`}
                  className="w-[100px] flex-shrink-0 h-full relative flex flex-col items-center pt-2.5 bg-gray-600/30 border-2 border-dashed border-gray-700"
                >
                  <div className="text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                    우부가{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="h-[50px] flex gap-2.5 items-center justify-center px-2.5 bg-gray-400 border-t border-gray-600">
            <button className="flex-1 h-9 text-[11px] font-bold bg-gray-500 border border-gray-700 rounded cursor-pointer text-gray-800 hover:bg-gray-600 active:bg-gray-700">
              좌측차선추가
            </button>
            <button className="flex-1 h-9 text-[11px] font-bold bg-gray-500 border border-gray-700 rounded cursor-pointer text-gray-800 hover:bg-gray-600 active:bg-gray-700">
              우측차선추가
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="col-span-2 bg-gray-400 border-t-2 border-gray-600 flex items-center justify-center gap-2.5 px-4">
          <button className="px-4 py-2 text-[11px] font-bold bg-gray-500 border border-gray-700 rounded cursor-pointer text-gray-800 hover:bg-gray-600 active:bg-gray-700">
            추정현황
          </button>
          <button className="px-4 py-2 text-[11px] font-bold bg-gray-500 border border-gray-700 rounded cursor-pointer text-gray-800 hover:bg-gray-600 active:bg-gray-700">
            변경
          </button>
          <button className="px-4 py-2 text-[11px] font-bold bg-gray-500 border border-gray-700 rounded cursor-pointer text-gray-800 hover:bg-gray-600 active:bg-gray-700">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPage;
