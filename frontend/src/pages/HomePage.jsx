import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="page pageHome">
      {/* Top nav */}
      <div className="topbar">
        <div className="brand">
          <div className="brandMark">Ko-ROOT</div>
          <div className="brandText">
            <div className="brandTitle">관광 경로 추천</div>
            <div className="brandSub muted">
              점수 기반 맞춤 경로 생성 (추천 vs 최단 비교)
            </div>
          </div>
        </div>

        <div className="topActions">
          <Link to="/planner">
            <button className="btn btnPrimary">경로 만들기</button>
          </Link>
        </div>
      </div>

      {/* Section 1: 메인 히어로 섹션 - 서비스의 핵심 가치 정의 */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* 배경 애니메이션 */}
        <div 
          className="heroBackground"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
            opacity: 0.3,
            zIndex: 0
          }}
        />
        <div 
          className="routeAnimation"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
            animation: 'routeDraw 3s ease-in-out infinite',
            zIndex: 0
          }}
        />

        <div className="heroLeft" style={{ position: 'relative', zIndex: 1 }}>
          {/* 사용 이유 한 문장 */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--primary)', 
            fontWeight: 600, 
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            계절에 맞는 최적의 산책로를 찾는 새로운 방법
          </div>

          <h1 className="heroTitle">
            당신을 위한 가장 쾌적한 산책로,
            <br />
            <span className="heroAccent">Ko-ROOT가 찾아줄게요</span>
          </h1>

          <p className="heroDesc">
            단순히 빠른 길이 아닌, 햇빛의 따스함과 관광지의 즐거움이 가득한 당신만의 맞춤 경로를 경험해 보세요.
          </p>

          <div className="heroCtas">
            <Link to="/planner">
              <button className="btn btnPrimary">지금 경로 만들기</button>
            </Link>
          </div>
        </div>

        {/* Right mock preview with animation */}
        <div className="heroRight" style={{ position: 'relative', zIndex: 1 }}>
          <div className="previewCard">
            <div className="previewHeader">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
              <div className="previewTitle">경로 추천</div>
            </div>

            <div className="previewBody">
              <div className="previewLeft">
                {/* 경로 비교 수치 */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>경로 비교</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#0066cc', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Ko-ROOT 추천</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#7f7f7f', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>최단 경로</span>
                  </div>
                </div>
                
                {/* 수치 비교 */}
                <div style={{ 
                  display: 'grid', 
                  gap: '8px',
                  padding: '10px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>거리</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066cc' }}>1.57km</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>vs</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>1.43km</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>점수</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0066cc' }}>52.4</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>vs</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>45.1</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>쾌적도</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>+40%</span>
                  </div>
                </div>
                
                {/* 이점 요약 */}
                <div style={{ 
                  padding: '10px',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: '#1e40af'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>✓ 더 따뜻한 경로</div>
                  <div style={{ fontWeight: 600 }}>✓ 관광지 경유</div>
                </div>
              </div>
              
              <div className="previewMap" style={{ position: 'relative', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>
                {/* 지도 스타일 배경 - 실제 지도 느낌 */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(203, 213, 225, 0.3) 18px, rgba(203, 213, 225, 0.3) 19px),
                    repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(203, 213, 225, 0.3) 18px, rgba(203, 213, 225, 0.3) 19px)
                  `,
                  opacity: 0.5
                }}></div>
                
                {/* 공원/녹지 영역 */}
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '20px',
                  width: '60px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
                  borderRadius: '8px',
                  opacity: 0.4,
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}></div>
                
                {/* 건물 블록들 - 더 현실적으로 */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '25px',
                  width: '45px',
                  height: '35px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #d1d5db'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '55px',
                  right: '35px',
                  width: '40px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #d1d5db'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '35px',
                  left: '45px',
                  width: '55px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #d1d5db'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '95px',
                  left: '75px',
                  width: '35px',
                  height: '45px',
                  background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #d1d5db'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '130px',
                  right: '50px',
                  width: '30px',
                  height: '35px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #d1d5db'
                }}></div>
                
                {/* 도로 네트워크 - 더 상세하게 */}
                <div style={{
                  position: 'absolute',
                  top: '45%',
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent 0%, #cbd5e1 10%, #cbd5e1 90%, transparent 100%)',
                  opacity: 0.6,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '38%',
                  width: '3px',
                  background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 10%, #cbd5e1 90%, transparent 100%)',
                  opacity: 0.6,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '70%',
                  left: '20%',
                  right: '30%',
                  height: '2px',
                  background: '#cbd5e1',
                  opacity: 0.4,
                  borderRadius: '1px'
                }}></div>
                
                {/* 출발지 마커 - 더 현실적으로 */}
                <div style={{
                  position: 'absolute',
                  top: '25px',
                  left: '18px',
                  width: '14px',
                  height: '14px',
                  background: '#dc2626',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4), 0 0 0 2px rgba(220, 38, 38, 0.2)',
                  zIndex: 10,
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '15px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#dc2626',
                  zIndex: 11
                }}>출발</div>
                
                {/* 도착지 마커 - 더 현실적으로 */}
                <div style={{
                  position: 'absolute',
                  bottom: '25px',
                  right: '25px',
                  width: '14px',
                  height: '14px',
                  background: '#16a34a',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.4), 0 0 0 2px rgba(22, 163, 74, 0.2)',
                  zIndex: 10,
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '22px',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#16a34a',
                  zIndex: 11
                }}>도착</div>
                
                {/* 추천 경로 (파란색, 애니메이션) - 더 부드럽게 */}
                <svg 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%',
                    zIndex: 5,
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0066cc" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 18 25 Q 50 40, 75 60 Q 100 80, 120 100 Q 140 120, 155 140 Q 170 160, 175 175"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="250"
                    strokeDashoffset="250"
                    style={{
                      animation: 'routeDrawPath 3s ease-in-out infinite',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 102, 204, 0.3))'
                    }}
                  />
                </svg>
                
                {/* 최단 경로 (회색) */}
                <svg 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%',
                    zIndex: 4,
                    opacity: 0.6,
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 200 200"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 18 25 L 100 100 L 175 175"
                    fill="none"
                    stroke="#7f7f7f"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 왜 필요할까요? - 기후 위기와 시민의 건강 */}
      <section className="section" id="why-needed">
        <h2 className="sectionTitle">왜 필요할까요?</h2>
        <div className="cards3">
          <div className="card featureCard">
            <div className="featureIcon">🌍</div>
            <div className="featureTitle">기후 위기 대응</div>
            <div className="muted">
              서울시 2030 탄소 중립 목표에 기여합니다.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🚶🏻</div>
            <div className="featureTitle">시민 건강 증진</div>
            <div className="muted">
              최단 경로 대비 쾌적도 40% 향상.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🌳</div>
            <div className="featureTitle">환경 보호</div>
            <div className="muted">
              연간 11,815톤 탄소 절감 (소나무 179만 그루 효과).
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 어떻게 작동하나요? - 과학적인 그림자 분석 */}
      <section className="section" id="how-it-works">
        <h2 className="sectionTitle">어떻게 작동하나요?</h2>
        <div className="cards3">
          <div className="card featureCard">
            <div className="featureIcon">☀️</div>
            <div className="featureTitle">그림자 시뮬레이션</div>
            <div className="muted">
              건물 높이와 태양 각도를 계산하여 정확한 그림자 영역을 분석합니다.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🌬️</div>
            <div className="featureTitle">풍속 데이터</div>
            <div className="muted">
              실시간 풍속 데이터를 반영하여 쾌적한 경로를 추천합니다.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">📊</div>
            <div className="featureTitle">다차원 점수</div>
            <div className="muted">
              그림자, 풍속, 경사도, 관광지 정보를 종합하여 최적 경로를 계산합니다.
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 나만의 산책 공식 - 계절별 맞춤 */}
      <section className="section" id="custom-formula">
        <h2 className="sectionTitle">나만의 산책 공식</h2>
        <div className="cards3">
          <div className="card featureCard">
            <div className="featureIcon">❄️</div>
            <div className="featureTitle">겨울</div>
            <div className="muted" style={{ fontSize: '16px', lineHeight: 1.6 }}>
              "햇볕이 잘 들고 따뜻한 붕어빵 노점상이 있는 길"
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">☀️</div>
            <div className="featureTitle">여름</div>
            <div className="muted" style={{ fontSize: '16px', lineHeight: 1.6 }}>
              "건물 그늘이 가득하고 무더위 쉼터가 가까운 시원한 길"
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🌸</div>
            <div className="featureTitle">봄/가을</div>
            <div className="muted" style={{ fontSize: '16px', lineHeight: 1.6 }}>
              "꽃길과 단풍이 아름다운 관광 중심의 길"
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: 얼마나 효과적일까요? - 수치로 보는 변화 */}
      <section className="section" id="effectiveness">
        <h2 className="sectionTitle">얼마나 효과적일까요?</h2>
        <div className="cards3">
          <div className="card featureCard">
            <div className="featureIcon">📈</div>
            <div className="featureTitle">쾌적도 향상</div>
            <div className="muted">
              <strong style={{ fontSize: '48px', color: 'var(--primary)', display: 'block', marginBottom: '8px', lineHeight: 1 }}>40%</strong>
              최단 경로 대비 쾌적도 향상
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🌲</div>
            <div className="featureTitle">환경 기여</div>
            <div className="muted">
              <strong style={{ fontSize: '36px', color: '#16a34a', display: 'block', marginBottom: '8px', lineHeight: 1 }}>11,815톤</strong>
              연간 탄소 절감 (소나무 179만 그루 효과)
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🎯</div>
            <div className="featureTitle">서울시 목표 기여</div>
            <div className="muted">
              <strong style={{ fontSize: '48px', color: '#16a34a', display: 'block', marginBottom: '8px', lineHeight: 1 }}>1%</strong>
              서울시 2030 탄소 중립 목표 기여
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="finalCta card">
        <div>
          <div className="finalTitle">지금 바로 시작해보세요</div>
          <div className="muted">
            오늘 종로에서 가장 따뜻하고 쾌적한 길을 찾아보세요.
          </div>
        </div>
        <Link to="/planner">
          <button className="btn btnPrimary">경로 만들기</button>
        </Link>
      </div>

      <footer className="footer muted">
        © {new Date().getFullYear()} ROOT Project
      </footer>
    </div>
  );
}
