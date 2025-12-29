# Kakao SDK 로드 실패 문제 해결 가이드

## 🔍 문제 진단

SDK 로드 실패 시 다음을 확인하세요:

### 1. 브라우저 콘솔 확인

개발자 도구(F12) > Console 탭에서 다음을 확인:
- SDK 로드 관련 로그 메시지
- 에러 메시지
- JavaScript 키가 표시되는지 (일부만 표시됨)

### 2. 네트워크 탭 확인

개발자 도구(F12) > Network 탭에서:
- `dapi.kakao.com/v2/maps/sdk.js` 요청 확인
- 상태 코드 확인 (200이어야 함)
- 403 또는 401 에러인지 확인

### 3. 플랫폼 도메인 확인

**Kakao Developers**에서:
1. 내 애플리케이션 선택
2. **앱 설정 > 플랫폼** 메뉴
3. **Web 플랫폼**에 다음이 정확히 등록되어 있는지 확인:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   - **주의**: 슬래시(/) 없이 정확히 위와 같이 등록
   - `http://localhost:3000/` (X) - 끝에 슬래시 있으면 안됨
   - `http://localhost:3000/planner` (X) - 경로 포함하면 안됨

### 4. JavaScript 키 확인

`.env` 파일에 올바른 키가 있는지 확인:
```bash
REACT_APP_KAKAO_JAVASCRIPT_KEY=5483aff8e53f6f10ac8da40b9bce4417
```

**중요**: 프론트엔드 서버를 재시작해야 환경 변수가 적용됩니다!

## 🛠️ 해결 방법

### 방법 1: 플랫폼 도메인 재등록

1. Kakao Developers에서 기존 Web 플랫폼 삭제
2. 다시 추가:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
3. 저장 후 1-2분 대기 (적용 시간 필요)
4. 브라우저 새로고침

### 방법 2: 브라우저 캐시 삭제

1. 개발자 도구(F12) 열기
2. Network 탭에서 "Disable cache" 체크
3. 또는 하드 리프레시: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

### 방법 3: 프론트엔드 서버 재시작

```bash
./stop.sh
./start-frontend.sh
```

### 방법 4: 직접 테스트

브라우저 콘솔에서 직접 테스트:

```javascript
// SDK 로드 테스트
const script = document.createElement('script');
script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=5483aff8e53f6f10ac8da40b9bce4417&libraries=services';
script.onload = () => console.log('SDK 로드 성공!', window.kakao);
script.onerror = (e) => console.error('SDK 로드 실패:', e);
document.head.appendChild(script);
```

## 📋 체크리스트

- [ ] JavaScript 키가 `.env` 파일에 올바르게 설정됨
- [ ] 프론트엔드 서버 재시작함
- [ ] 플랫폼 도메인이 정확히 등록됨 (슬래시 없이)
- [ ] 브라우저 콘솔에서 에러 메시지 확인
- [ ] 네트워크 탭에서 SDK 스크립트 로드 확인
- [ ] 브라우저 캐시 삭제 또는 하드 리프레시

## ⚠️ 주의사항

1. **플랫폼 도메인 등록 후 적용 시간**: 1-2분 소요될 수 있음
2. **환경 변수 변경 후**: 반드시 서버 재시작 필요
3. **브라우저 캐시**: 개발 중에는 캐시가 문제가 될 수 있음


