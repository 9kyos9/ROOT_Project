import React from 'react';
// ShortTermWeather.js 파일을 불러옵니다.
import ShortTermWeather from './ShortTermWeather'; 
import './App.css'; // 기본 스타일 파일 (create-react-app에서 자동으로 생성됨)

function App() {
  return (
    // 전체 페이지를 위한 컨테이너입니다.
    <div className="App" style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      
      {/* 애플리케이션의 제목 */}
      <h1 style={{ color: '#0056b3', borderBottom: '3px solid #ccc', paddingBottom: '10px', display: 'inline-block' }}>
        🇰🇷 기상청 동네 예보 조회기
      </h1>
      
      {/* 우리가 날씨 API 연동 로직을 모두 작성한 
        ShortTermWeather 컴포넌트를 렌더링합니다.
      */}
      <ShortTermWeather /> 
      
    </div>
  );
}

export default App;