import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./HomePage.css";

export default function HomePage() {
  const sectionRefs = useRef([]);

  useEffect(() => {
    // 스크롤 애니메이션
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(el => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      }
    });

    return () => {
      sectionRefs.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* 상단 네비게이션 */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">Ko-ROOT</div>
          <ul className="nav-menu">
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>제품</a></li>
            <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>기능</a></li>
            <li><a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollToSection('use-cases'); }}>사용 사례</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>소개</a></li>
          </ul>
          <Link to="/planner" className="nav-cta">경로 만들기</Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="hero">
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-line line-1"></div>
        </div>
        <div className="hero-content">
          <h1>당신을 위한 가장 쾌적한 산책로,<br />Ko-ROOT가 찾아줄게요</h1>
          <p>단순히 빠른 길이 아닌, 햇빛의 따스함과 관광지의 즐거움이 가득한<br />당신만의 맞춤 경로를 경험해 보세요.</p>
          <div className="download-buttons">
            <Link to="/planner" className="download-btn">지금 경로 만들기</Link>
            <a href="#how-it-works" className="download-btn secondary" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>서비스 알아보기</a>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 섹션 1 */}
      <section className="section" id="features" ref={el => sectionRefs.current[0] = el}>
        <div className="section-content">
          <div className="section-text">
            <h2>사소한 디테일까지 모두 고려합니다</h2>
            <p>계절별 그림자, 풍속, 관광 정보를 종합 분석하여 당신의 계절에 딱 맞는 최적의 산책로를 추천합니다. 단순 최단경로가 아닌, 건강과 환경을 고려한 스마트한 도보 경로를 제안합니다.</p>
          </div>
          <div className="section-visual">
            <div className="placeholder-visual">🗺️</div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 섹션 2 */}
      <section className="section" id="how-it-works" ref={el => sectionRefs.current[1] = el}>
        <div className="section-content reverse">
          <div className="section-text">
            <h2>과학적 데이터로 경로를 계산합니다</h2>
            <p>건물의 높이와 태양의 각도를 계산하여 정확한 그림자 영역을 분석하고, 실시간 풍속 데이터를 반영하여 쾌적한 경로를 추천합니다. 그림자, 풍속, 경사도, 관광지 정보를 종합하여 최적 경로를 계산합니다.</p>
          </div>
          <div className="section-visual">
            <div className="placeholder-visual">📊</div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 섹션 3 */}
      <section className="section" id="custom-formula" ref={el => sectionRefs.current[2] = el}>
        <div className="section-content">
          <div className="section-text">
            <h2>나만의 산책 공식</h2>
            <p>계절에 맞는 맞춤 경로를 제공합니다. 겨울에는 햇볕이 잘 들고 따뜻한 붕어빵 노점상이 있는 길을, 여름에는 건물 그늘이 가득하고 무더위 쉼터가 가까운 시원한 길을, 봄/가을에는 꽃길과 단풍이 아름다운 관광 중심의 길을 추천합니다.</p>
          </div>
          <div className="section-visual">
            <div className="placeholder-visual">🌸</div>
          </div>
        </div>
      </section>

      {/* 사용 시나리오 섹션 */}
      <section className="use-cases" id="use-cases">
        <div className="use-cases-container">
          <h2>어떤 상황에서 사용하나요?</h2>
          <div className="use-cases-grid">
            <div className="use-case-card" ref={el => sectionRefs.current[3] = el}>
              <div className="use-case-icon">🚶</div>
              <h3>일상 산책</h3>
              <p>매일 걷는 길도<br />더 쾌적하게</p>
            </div>
            <div className="use-case-card" ref={el => sectionRefs.current[4] = el}>
              <div className="use-case-icon">🧳</div>
              <h3>관광</h3>
              <p>종로구 관광지를<br />효율적으로 탐방</p>
            </div>
            <div className="use-case-card" ref={el => sectionRefs.current[5] = el}>
              <div className="use-case-icon">🏃</div>
              <h3>운동</h3>
              <p>건강한 보행<br />경로 추천</p>
            </div>
            <div className="use-case-card" ref={el => sectionRefs.current[6] = el}>
              <div className="use-case-icon">🌱</div>
              <h3>환경 보호</h3>
              <p>탄소 절감에<br />기여하는 경로</p>
            </div>
            <div className="use-case-card" ref={el => sectionRefs.current[7] = el}>
              <div className="use-case-icon">🏥</div>
              <h3>건강 관리</h3>
              <p>쾌적한 환경에서<br />건강 증진</p>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer>
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-section">
              <h4>다운로드</h4>
              <ul>
                <li><Link to="/planner">웹 버전</Link></li>
                <li><a href="#mobile">모바일 앱 (준비중)</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>제품</h4>
              <ul>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>기능</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>작동 원리</a></li>
                <li><a href="#pricing">요금제</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>지원</h4>
              <ul>
                <li><a href="#help">도움말</a></li>
                <li><a href="#contact">문의하기</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>회사</h4>
              <ul>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>소개</a></li>
                <li><a href="#blog">블로그</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>
              <p>&copy; {new Date().getFullYear()} Ko-ROOT Project. All rights reserved.</p>
            </div>
            <div className="social-icons">
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
            <select className="language-select">
              <option>한국어</option>
              <option>English</option>
              <option>日本語</option>
            </select>
          </div>
        </div>
      </footer>
    </div>
  );
}
