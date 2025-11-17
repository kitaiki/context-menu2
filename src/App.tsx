import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lane from './pages/Lane';
import Test from './pages/Test';
import SnapPage from './pages/SnapPage';
import SnapPage2 from './pages/SnapPage2';
import SnapPage3 from './pages/SnapPage3';
import SnapPage4 from './pages/SnapPage4';
import './App.css';
import MapPage from './map-test/pages/MapPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage/>}/>
        <Route path='/lane' element={<Lane/>} />
        <Route path='/test' element={<Test/>} />
        <Route path='/snap' element={<SnapPage/>} />
        <Route path='/snap2' element={<SnapPage2/>} />
        <Route path='/snap3' element={<SnapPage3/>} />
        <Route path='/snap4' element={<SnapPage4/>} />

      </Routes>
    </Router>
  );
};

export default App;