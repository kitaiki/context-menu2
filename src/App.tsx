import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import ModalPage from './pages/ModalPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <main className="app-main">
              {/* 지도 컴포넌트 */}
              <MapComponent
                center={[126.9780, 37.5665]} // 서울 중심
                zoom={13}
              />
            </main>
          </div>
        } />
        <Route path="/modal" element={<ModalPage />} />
      </Routes>
    </Router>
  );
};

export default App;