# Kakao Map API JavaScript SDK로 전환 가이드

## 🔄 변경 사항

최근 Kakao는 보안 강화로 **REST API 키의 브라우저 직접 호출을 제한**하고 있습니다.
따라서 **JavaScript SDK**를 사용하도록 코드를 변경했습니다.

## 📝 필요한 설정

### 1. JavaScript 키 발급 및 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 내 애플리케이션 선택
3. **앱 설정 > 앱 키** 메뉴에서 **JavaScript 키** 확인
4. `frontend/.env` 파일에 추가:

```bash
# 기존 REST API 키 (백엔드에서 사용 가능)
REACT_APP_KAKAO_REST_API_KEY=c3b5dea6d228f84b42b45304208e3bb6

# 새로 추가: JavaScript 키
REACT_APP_KAKAO_JAVASCRIPT_KEY=your_javascript_key_here
```

### 2. 플랫폼 도메인 등록

**앱 설정 > 플랫폼** 메뉴에서:
- Web 플랫폼 등록
- 다음 도메인 추가:
  ```
  http://localhost:3000
  http://127.0.0.1:3000
  ```

### 3. index.html 수정

`public/index.html` 파일에서 JavaScript 키를 실제 키로 교체:

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY&libraries=services"
  async
></script>
```

또는 동적으로 로드하도록 코드에서 처리 (현재 구현 방식)

## ✅ 장점

1. **CORS 문제 없음**: JavaScript SDK는 브라우저에서 직접 사용 가능
2. **IP 제한 불필요**: REST API 키의 IP 제한 설정 불필요
3. **더 안정적**: Kakao가 권장하는 방식

## 🔧 코드 변경 사항

- `placeSearch.js`: REST API 호출 → JavaScript SDK 사용
- `searchPlace()`: `kakao.maps.services.Places()` 사용
- `addressToCoords()`: `kakao.maps.services.Geocoder()` 사용

## 🚀 사용 방법

JavaScript 키만 설정하면 바로 사용 가능합니다!

```bash
# .env 파일에 추가
REACT_APP_KAKAO_JAVASCRIPT_KEY=your_javascript_key_here
```

프론트엔드 서버 재시작 후 사용하세요.

