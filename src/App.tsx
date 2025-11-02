import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import Lane from './pages/Lane';
import Test from './pages/Test';
import SnapPage from './pages/SnapPage';
import SnapPage2 from './pages/SnapPage2';
import SnapPage3 from './pages/SnapPage3';
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
        <Route path='/lane' element={<Lane/>} />
        <Route path='/test' element={<Test/>} />
        <Route path='/snap' element={<SnapPage/>} />
        <Route path='/snap2' element={<SnapPage2/>} />
        <Route path='/snap3' element={<SnapPage3/>} />
      </Routes>
    </Router>
  );
};

export default App;