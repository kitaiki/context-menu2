import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f5f7fa'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
              ⚠️ 애플리케이션 오류
            </h1>
            <p style={{ color: '#7f8c8d', marginBottom: '20px', lineHeight: '1.6' }}>
              애플리케이션을 로드하는 중 오류가 발생했습니다.
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <details style={{ 
              textAlign: 'left', 
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                기술 정보 (개발자용)
              </summary>
              <pre style={{ 
                marginTop: '10px', 
                overflow: 'auto',
                fontSize: '11px',
                color: '#e74c3c'
              }}>
                {this.state.error?.message}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🔄 페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring
const measureAppLoad = () => {
  if (typeof performance !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        console.log(`🚀 앱 로드 성능 정보:
          - DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms
          - Load Event: ${loadTime.toFixed(2)}ms
          - Total Load Time: ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms
        `);
      }, 0);
    });
  }
};

// Initialize performance monitoring
measureAppLoad();

// Development mode logging
if (import.meta.env.DEV) {
  console.log(`
  🗺️ OpenLayers React Map
  ========================
  환경: 개발 모드
  React: ${React.version}
  Vite: ${import.meta.env.VITE_APP_VERSION || 'Unknown'}
  Node: ${import.meta.env.VITE_NODE_VERSION || 'Unknown'}
  
  기능:
  ✅ TypeScript 지원
  ✅ OpenLayers 8 지도
  ✅ OpenStreetMap (OSM)
  ✅ 반응형 디자인
  ✅ 실시간 위치 추적
  ✅ 에러 바운더리
  ✅ 성능 모니터링
  `);
}

// Create React app root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('./App.tsx', () => {
    console.log('🔥 Hot reload: App.tsx updated');
  });
}

// Cleanup function for proper unmounting
if (import.meta.env.DEV) {
  const cleanup = () => {
    console.log('🧹 Cleaning up React app...');
  };
  
  window.addEventListener('beforeunload', cleanup);
}