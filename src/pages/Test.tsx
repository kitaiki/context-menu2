import React from 'react';

interface LaneData {
  bits: number[];
  angle: number;
}

const Test: React.FC = () => {

  //angle: 1이 정북 0도 -> 30도씩 이동 12는 330도
  //angle: 12, 1, 2 직진, 3,4,5 우회전, 6,7,8 유턴, 9,10,11 좌회전
  //1차선 좌회전, 2차선 직진+좌회전, 3,4 차선 직진, 5차선 직진+우회전
  //1은 차선이 있음, 0은 차선 없음
  const r1 = {bits: [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], angle: 10};
  const r3 = {bits: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], angle: 4};
  const r2 = {bits: [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0], angle: 1};

  const laneData = [r1, r2, r3];

  //차선 유효성 검사
  //차선은 1차선 부터 순서대로 있어야하면 중간에 비어 있을 수는 없다.
  //유턴, 좌회전, 직진, 우회전 순

  // angle 값으로 방향 반환
  const getDirectionByAngle = (angle: number): string => {
    if (angle === 12 || angle === 1 || angle === 2) return '직진';
    if (angle === 3 || angle === 4 || angle === 5) return '우회전';
    if (angle === 6 || angle === 7 || angle === 8) return '유턴';
    if (angle === 9 || angle === 10 || angle === 11) return '좌회전';
    return '알 수 없음';
  };

  // 방향 우선순위 (유턴 > 좌회전 > 직진 > 우회전)
  const directionPriority: { [key: string]: number } = {
    '유턴': 1,
    '좌회전': 2,
    '직진': 3,
    '우회전': 4
  };

  // 차선 유효성 검사 로직
  const validateLanes = (data: LaneData[]) => {
    const errors: string[] = [];
    const laneMap: { [key: number]: { angles: number[]; directions: string[] } } = {};

    // 1. 각 데이터를 차선별로 그룹핑
    data.forEach((item) => {
      item.bits.forEach((bit, index) => {
        if (bit === 1) {
          const laneNumber = index + 1;
          if (!laneMap[laneNumber]) {
            laneMap[laneNumber] = { angles: [], directions: [] };
          }
          laneMap[laneNumber].angles.push(item.angle);

          const direction = getDirectionByAngle(item.angle);
          if (!laneMap[laneNumber].directions.includes(direction)) {
            laneMap[laneNumber].directions.push(direction);
          }
        }
      });
    });

    // 2. 차선 번호가 1부터 연속적인지 검사
    const laneNumbers = Object.keys(laneMap).map(Number).sort((a, b) => a - b);

    if (laneNumbers.length > 0 && laneNumbers[0] !== 1) {
      errors.push(`차선은 1차선부터 시작해야 합니다. (현재 ${laneNumbers[0]}차선부터 시작)`);
    }

    for (let i = 0; i < laneNumbers.length - 1; i++) {
      if (laneNumbers[i + 1] - laneNumbers[i] > 1) {
        errors.push(`차선 번호가 연속적이지 않습니다: ${laneNumbers[i]}차선과 ${laneNumbers[i + 1]}차선 사이에 빈 차선이 있습니다.`);
      }
    }

    // 3. 방향 순서 검사 (유턴 > 좌회전 > 직진 > 우회전)
    let prevMaxPriority = 0;

    laneNumbers.forEach(laneNum => {
      const directions = laneMap[laneNum].directions;

      // 해당 차선의 최소 우선순위 (숫자가 작을수록 우선순위 높음)
      const minPriority = Math.min(...directions.map(d => directionPriority[d]));

      if (minPriority < prevMaxPriority) {
        errors.push(`${laneNum}차선: 차선 방향 순서가 잘못되었습니다. (유턴 > 좌회전 > 직진 > 우회전 순서를 지켜야 합니다)`);
      }

      // 해당 차선의 최대 우선순위 업데이트
      const maxPriority = Math.max(...directions.map(d => directionPriority[d]));
      prevMaxPriority = maxPriority;
    });

    return {
      isValid: errors.length === 0,
      errors,
      laneMap
    };
  };

  // 검사 실행
  const result = validateLanes(laneData);

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">차선 유효성 검사</h1>

        {/* 규칙 설명 */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
          <h3 className="text-md font-bold text-blue-900 mb-2">검사 규칙:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>차선은 1차선부터 시작해야 함</li>
            <li>차선 번호가 연속적이어야 함 (중간에 빈 차선 없어야 함)</li>
            <li>차선 방향 순서: 유턴 → 좌회전 → 직진 → 우회전</li>
            <li>angle 정의: 1=정북(0°), 30°씩 회전, 12=330°</li>
            <li>방향 매핑: 직진(12,1,2), 우회전(3,4,5), 유턴(6,7,8), 좌회전(9,10,11)</li>
          </ul>
        </div>

        {/* 입력 데이터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">입력 데이터:</h2>
          <div className="space-y-2">
            {laneData.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-mono mb-2">
                  r{index + 1}: angle={item.angle} ({getDirectionByAngle(item.angle)})
                </div>
                <div className="flex gap-1">
                  {item.bits.map((bit, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${
                        bit === 1
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {bit}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  {item.bits.map((_, idx) => (
                    <div key={idx} className="w-8 text-center text-xs text-gray-500">
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 검사 결과 */}
        <div className={`rounded-lg shadow-lg p-6 mb-6 ${
          result.isValid
            ? 'bg-green-50 border-2 border-green-500'
            : 'bg-red-50 border-2 border-red-500'
        }`}>
          <h2 className="text-lg font-bold mb-4">
            {result.isValid ? '✅ 유효성 검사 통과' : '❌ 유효성 검사 실패'}
          </h2>

          {!result.isValid && (
            <div className="space-y-2">
              <p className="font-semibold text-red-800">오류 목록:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 차선별 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">차선별 정보:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(result.laneMap)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([lane, info]) => {
                const directionColor =
                  info.directions.includes('유턴') ? 'purple' :
                  info.directions.includes('좌회전') ? 'blue' :
                  info.directions.includes('우회전') ? 'orange' : 'green';

                return (
                  <div key={lane} className={`p-4 bg-${directionColor}-50 rounded border-2 border-${directionColor}-300`}>
                    <div className="font-bold text-lg mb-2">{lane}차선</div>
                    <div className="text-sm">
                      <span className="font-semibold">방향:</span> {info.directions.join(' + ')}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      angle: {info.angles.join(', ')}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 예상 결과 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-md font-bold text-gray-800 mb-2">예상 결과:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>1차선: 좌회전 (angle: 10)</li>
            <li>2차선: 직진 + 좌회전 (angle: 1, 10)</li>
            <li>3차선: 직진 (angle: 1)</li>
            <li>4차선: 직진 (angle: 1)</li>
            <li>5차선: 직진 + 우회전 (angle: 1, 4)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Test;
