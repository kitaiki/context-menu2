import React, { useState } from 'react';

interface LaneInfo {
  bits: number[];
  angle: number;
  outLinkId: number;
}

// 각도별 방향 이미지 매핑 (12시 방향부터 30도씩)
const getDirectionImage = (angle: number): string => {
  const directions: { [key: number]: string } = {
    1: 'straight',    // 직진
    4: 'right',       // 우회전
    7: 'uturn',       // 유턴
    10: 'left'        // 좌회전
  };
  return directions[angle] || 'straight';
};

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

  // 차선별 방향 정보 계산 (outLinkId 포함)
  const getLaneDirections = (): { laneNumber: number; directions: string[]; outLinkIds: number[] }[] => {
    const laneDirections: { [key: number]: { directions: string[]; outLinkIds: number[] } } = {};

    laneInfo.forEach((info) => {
      info.bits.forEach((bit, index) => {
        if (bit === 1) {
          const laneNumber = index + 1;
          if (!laneDirections[laneNumber]) {
            laneDirections[laneNumber] = { directions: [], outLinkIds: [] };
          }
          const direction = getDirectionImage(info.angle);
          if (!laneDirections[laneNumber].directions.includes(direction)) {
            laneDirections[laneNumber].directions.push(direction);
          }
          if (!laneDirections[laneNumber].outLinkIds.includes(info.outLinkId)) {
            laneDirections[laneNumber].outLinkIds.push(info.outLinkId);
          }
        }
      });
    });

    return Object.entries(laneDirections).map(([lane, data]) => ({
      laneNumber: parseInt(lane),
      directions: data.directions,
      outLinkIds: data.outLinkIds
    }));
  };

  // 특정 outLinkId가 포함된 차선인지 확인
  const isLaneHighlighted = (outLinkIds: number[]): boolean => {
    return selectedOutLinkId !== null && outLinkIds.includes(selectedOutLinkId);
  };

  const laneDirections = getLaneDirections();

  // 방향별 아이콘 매핑
  const getDirectionIcon = (direction: string): string => {
    const icons: { [key: string]: string } = {
      'left': '←',
      'straight': '↑',
      'right': '→',
      'uturn': '↶'
    };
    return icons[direction] || '↑';
  };

  // 방향별 한글명
  const getDirectionName = (direction: string): string => {
    const names: { [key: string]: string } = {
      'left': '좌회전',
      'straight': '직진',
      'right': '우회전',
      'uturn': '유턴'
    };
    return names[direction] || '직진';
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#2c3e50',
      padding: '20px'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>차선 안내</h1>

      {/* outLinkId 선택 */}
      <div style={{
        marginBottom: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>OutLinkId 선택:</span>
        <button
          onClick={() => setSelectedOutLinkId(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: selectedOutLinkId === null ? '2px solid #3498db' : '1px solid #ccc',
            background: selectedOutLinkId === null ? '#3498db' : 'white',
            color: selectedOutLinkId === null ? 'white' : '#2c3e50',
            cursor: 'pointer',
            fontWeight: selectedOutLinkId === null ? 'bold' : 'normal'
          }}
        >
          전체
        </button>
        {laneInfo.map((info) => (
          <button
            key={info.outLinkId}
            onClick={() => setSelectedOutLinkId(info.outLinkId)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: selectedOutLinkId === info.outLinkId ? '2px solid #ffc107' : '1px solid #ccc',
              background: selectedOutLinkId === info.outLinkId ? '#ffc107' : 'white',
              color: selectedOutLinkId === info.outLinkId ? 'white' : '#2c3e50',
              cursor: 'pointer',
              fontWeight: selectedOutLinkId === info.outLinkId ? 'bold' : 'normal'
            }}
          >
            {info.outLinkId}
          </button>
        ))}
      </div>

      {/* 차선 표시 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {laneDirections.map((lane) => {
          const isHighlighted = isLaneHighlighted(lane.outLinkIds);
          return (
            <div
              key={lane.laneNumber}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                background: isHighlighted ? '#fff3cd' : '#ecf0f1',
                borderRadius: '8px',
                minWidth: '120px',
                border: isHighlighted ? '4px solid #ffc107' : '3px solid #34495e',
                boxShadow: isHighlighted ? '0 0 20px rgba(255, 193, 7, 0.5)' : 'none',
                transition: 'all 0.3s ease',
                transform: isHighlighted ? 'scale(1.05)' : 'scale(1)'
              }}
            >
            {/* 차선 번호 */}
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '15px',
              color: '#2c3e50'
            }}>
              {lane.laneNumber}차선
            </div>

            {/* 방향 아이콘들 (겹쳐서 표시) */}
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              marginBottom: '15px'
            }}>
              {lane.directions.map((direction, index) => (
                <div
                  key={direction}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '60px',
                    color: index === 0 ? '#e74c3c' : '#3498db',
                    opacity: index === 0 ? 1 : 0.7,
                    transform: `translate(${index * 10}px, ${index * 10}px)`,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {getDirectionIcon(direction)}
                </div>
              ))}
            </div>

            {/* 방향 텍스트 */}
            <div style={{
              fontSize: '14px',
              color: '#2c3e50',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {lane.directions.map(dir => getDirectionName(dir)).join(' + ')}
            </div>
          </div>
          );
        })}
      </div>

      {/* 차선 정보 패널 */}
      <div style={{
        marginTop: '30px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>원본 데이터</h3>
        {laneInfo.map((lane, index) => (
          <div
            key={index}
            style={{
              marginBottom: '10px',
              fontSize: '14px',
              padding: '8px',
              background: selectedOutLinkId === lane.outLinkId ? '#fff3cd' : '#ecf0f1',
              borderRadius: '4px',
              border: selectedOutLinkId === lane.outLinkId ? '2px solid #ffc107' : '1px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedOutLinkId(lane.outLinkId)}
          >
            <strong>구간 {index + 1}:</strong> bits=[{lane.bits.join(', ')}], angle={lane.angle}, outLinkId={lane.outLinkId}
            <span style={{ marginLeft: '10px', color: '#7f8c8d' }}>
              (방향: {getDirectionName(getDirectionImage(lane.angle))})
            </span>
          </div>
        ))}

        <div style={{ marginTop: '20px', padding: '10px', background: '#d5dbdb', borderRadius: '4px' }}>
          <strong>참고:</strong>
          <ul style={{ margin: '10px 0 0 20px', fontSize: '13px' }}>
            <li>angle 1~12: 12시 방향부터 30도씩 회전</li>
            <li>bits: [좌2, 좌1, 중앙, 우1, 우2] 차선 위치</li>
            <li>같은 차선의 여러 방향은 겹쳐서 표시됨</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Lane;
