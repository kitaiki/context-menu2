import React from 'react';

interface LaneInfo {
  bits: number[];
  angle: number;
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
  // 차선 정보 데이터
  const laneInfo: LaneInfo[] = [
    { bits: [0, 1, 1, 1, 0], angle: 1 },
    { bits: [1, 0, 0, 0, 0], angle: 10 },
    { bits: [1, 0, 0, 0, 0], angle: 7 },
    { bits: [0, 0, 0, 0, 1], angle: 4 },
    { bits: [0, 0, 0, 0, 1], angle: 1 }
  ];

  // 차선별 방향 정보 계산
  const getLaneDirections = (): { laneNumber: number; directions: string[] }[] => {
    const laneDirections: { [key: number]: string[] } = {};

    laneInfo.forEach((info) => {
      info.bits.forEach((bit, index) => {
        if (bit === 1) {
          const laneNumber = index + 1;
          if (!laneDirections[laneNumber]) {
            laneDirections[laneNumber] = [];
          }
          const direction = getDirectionImage(info.angle);
          if (!laneDirections[laneNumber].includes(direction)) {
            laneDirections[laneNumber].push(direction);
          }
        }
      });
    });

    return Object.entries(laneDirections).map(([lane, dirs]) => ({
      laneNumber: parseInt(lane),
      directions: dirs
    }));
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
      <h1 style={{ color: 'white', marginBottom: '30px' }}>차선 안내</h1>

      {/* 차선 표시 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {laneDirections.map((lane) => (
          <div
            key={lane.laneNumber}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              background: '#ecf0f1',
              borderRadius: '8px',
              minWidth: '120px',
              border: '3px solid #34495e'
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
        ))}
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
          <div key={index} style={{
            marginBottom: '10px',
            fontSize: '14px',
            padding: '8px',
            background: '#ecf0f1',
            borderRadius: '4px'
          }}>
            <strong>구간 {index + 1}:</strong> bits=[{lane.bits.join(', ')}], angle={lane.angle}
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
