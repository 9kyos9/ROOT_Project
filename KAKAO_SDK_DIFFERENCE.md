# Kakao SDK 차이점 설명

## 📚 두 가지 다른 SDK

Kakao는 **두 가지 다른 JavaScript SDK**를 제공합니다:

### 1. 일반 JavaScript SDK (카카오 로그인 등)
- **URL**: `https://t1.kakaocdn.net/kakao_js_sdk/${VERSION}/kakao.min.js`
- **문서**: https://developers.kakao.com/docs/latest/ko/javascript/getting-started
- **용도**: 카카오 로그인, 카카오톡 공유 등
- **초기화 필요**: `Kakao.init('JAVASCRIPT_KEY')` 호출 필수
- **사용 예시**:
  ```javascript
  Kakao.init('JAVASCRIPT_KEY');
  Kakao.Auth.login();
  ```

### 2. Maps API JavaScript SDK (지도, 장소 검색)
- **URL**: `https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY&libraries=services`
- **문서**: https://apis.map.kakao.com/web/guide/
- **용도**: 지도 표시, 장소 검색, 좌표 변환 등
- **초기화 불필요**: 스크립트 로드 후 바로 `window.kakao.maps` 사용 가능
- **사용 예시**:
  ```javascript
  // 초기화 없이 바로 사용
  const ps = new window.kakao.maps.services.Places();
  ps.keywordSearch('경복궁', callback);
  ```

## ✅ 현재 프로젝트 설정

현재 프로젝트는 **Maps API JavaScript SDK**를 사용하고 있습니다:
- ✅ 올바른 SDK URL 사용: `dapi.kakao.com/v2/maps/sdk.js`
- ✅ 초기화 불필요 (Maps API는 `Kakao.init()` 불필요)
- ✅ 환경 변수로 API 키 관리

## 🔧 수정 사항

1. **`index.html`**: 하드코딩된 API 키 제거
2. **`placeSearch.js`**: 동적 로딩 방식 유지 (환경 변수 사용)

## 📖 참고 문서

- **Maps API 문서**: https://apis.map.kakao.com/web/guide/
- **일반 JavaScript SDK 문서**: https://developers.kakao.com/docs/latest/ko/javascript/getting-started

