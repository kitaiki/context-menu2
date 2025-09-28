import React from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

const App: React.FC = () => {


  return (
    <div className="app">

      <main className="app-main">
        {/* 지도 컴포넌트 */}
        <MapComponent
          center={[126.9780, 37.5665]} // 서울 중심
          zoom={13}
        />
      </main>
    </div>
  );
};

export default App;