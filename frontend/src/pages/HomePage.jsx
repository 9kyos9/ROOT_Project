import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="page pageHome">
      {/* Top nav */}
      <div className="topbar">
        <div className="brand">
          <div className="brandMark">ROOT</div>
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

      {/* Hero */}
      <section className="hero">
        <div className="heroLeft">
          <h1 className="heroTitle">
            관광에 특화된
            <br />
            <span className="heroAccent">추천 경로</span>를 만들어줘요
          </h1>

          <p className="heroDesc">
            단순 최단경로가 아니라, 여러 요소 점수(예: 선호도/혼잡도/비용/날씨 등)를
            반영해 “더 좋은 여행 동선”을 추천합니다.
          </p>

          <div className="heroCtas">
            <Link to="/planner">
              <button className="btn btnPrimary">지금 경로 만들기</button>
            </Link>
            <a className="btn btnGhost" href="#how">
              어떻게 동작해?
            </a>
          </div>

          <div className="heroBadges">
            <span className="badge">추천 경로 생성</span>
            <span className="badge">최단 경로 비교</span>
            <span className="badge">지도 기반 UI</span>
          </div>
        </div>

        {/* Right mock preview */}
        <div className="heroRight">
          <div className="previewCard">
            <div className="previewHeader">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
              <div className="previewTitle">Planner Preview</div>
            </div>

            <div className="previewBody">
              <div className="previewLeft">
                <div className="skeletonLine w60" />
                <div className="skeletonLine w80" />
                <div className="skeletonLine w70" />
                <div className="skeletonBox" />
                <div className="skeletonBtn" />
              </div>
              <div className="previewMap">
                <div className="mapGrid" />
                <div className="mapRouteRec" />
                <div className="mapRouteShort" />
              </div>
            </div>

            <div className="previewFooter muted">
              * 현재는 프론트 디자인/흐름을 먼저 완성 중입니다.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <h2 className="sectionTitle">핵심 기능</h2>
        <div className="cards3">
          <div className="card featureCard">
            <div className="featureIcon">🧭</div>
            <div className="featureTitle">점수 기반 추천</div>
            <div className="muted">
              여러 요소 가중치를 반영해 관광 목적에 맞는 경로를 도출합니다.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">🗺️</div>
            <div className="featureTitle">지도 중심 경험</div>
            <div className="muted">
              지도에서 출발지/관광지/경로를 한 눈에 확인할 수 있습니다.
            </div>
          </div>

          <div className="card featureCard">
            <div className="featureIcon">⚖️</div>
            <div className="featureTitle">추천 vs 최단 비교</div>
            <div className="muted">
              추천 경로가 최단 경로와 얼마나 다른지 지표로 비교합니다.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how">
        <h2 className="sectionTitle">사용 방법</h2>
        <div className="steps">
          <div className="step">
            <div className="stepNum">1</div>
            <div>
              <div className="stepTitle">출발지 & 관광지 선택</div>
              <div className="muted">현재 위치 또는 지정 위치에서 시작해요.</div>
            </div>
          </div>
          <div className="step">
            <div className="stepNum">2</div>
            <div>
              <div className="stepTitle">가중치 조절</div>
              <div className="muted">
                경치/혼잡도/비용 등 원하는 기준을 반영해요.
              </div>
            </div>
          </div>
          <div className="step">
            <div className="stepNum">3</div>
            <div>
              <div className="stepTitle">경로 생성 & 비교</div>
              <div className="muted">
                추천 경로와 최단 경로를 동시에 확인합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="finalCta card">
          <div>
            <div className="finalTitle">바로 시작해볼까요?</div>
            <div className="muted">
              플래너 화면에서 경로 생성 흐름과 UI를 먼저 완성해둡니다.
            </div>
          </div>
          <Link to="/planner">
            <button className="btn btnPrimary">경로 만들기</button>
          </Link>
        </div>
      </section>

      <footer className="footer muted">
        © {new Date().getFullYear()} ROOT Project
      </footer>
    </div>
  );
}
