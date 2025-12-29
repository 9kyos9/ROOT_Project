# Kakao Map API 설정 가이드

## 🔧 필요한 설정 사항

### 1. 플랫폼 도메인 등록 (필수!)

Kakao Developers에서 다음 도메인을 등록해야 합니다:

1. [Kakao Developers](https://developers.kakao.com/)에 로그인
2. 내 애플리케이션 선택
3. **앱 설정 > 플랫폼** 메뉴로 이동
4. **Web 플랫폼 등록** 클릭
5. 다음 도메인들을 등록:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - (배포 시) 실제 도메인 (예: `https://yourdomain.com`)

### 2. API 활성화 확인

**앱 설정 > 제품 설정**에서 다음 API가 활성화되어 있는지 확인:
- ✅ **REST API 키** 활성화
- ✅ **카카오 로그인** (필요한 경우)
- ✅ **카카오맵** (필요한 경우)

### 3. CORS 문제 해결

브라우저에서 직접 Kakao API를 호출할 때 CORS 에러가 발생할 수 있습니다.

**해결 방법:**
- 백엔드 프록시를 통해 API 호출 (권장)
- 또는 Kakao Developers에서 플랫폼 도메인을 정확히 등록

## 🐛 문제 해결

### 문제 1: "CORS 에러" 또는 "401 Unauthorized"

**원인:** 플랫폼 도메인이 등록되지 않았거나 잘못 등록됨

**해결:**
1. Kakao Developers에서 플랫폼 도메인 확인
2. `http://localhost:3000` 정확히 등록되어 있는지 확인
3. 브라우저 콘솔에서 정확한 에러 메시지 확인

### 문제 2: "검색 결과가 없습니다"

**원인:** API 키가 잘못되었거나 권한이 없음

**해결:**
1. `.env` 파일의 API 키 확인
2. REST API 키가 올바른지 확인
3. 프론트엔드 서버 재시작 (환경 변수 적용)

### 문제 3: API 호출은 되지만 결과가 비어있음

**원인:** 검색어가 너무 구체적이거나 결과가 없음

**해결:**
- 더 일반적인 검색어 사용 (예: "경복궁", "북촌" 등)
- 브라우저 콘솔에서 API 응답 확인

## 📝 테스트 방법

브라우저 콘솔에서 직접 테스트:

```javascript
// API 키 확인
console.log(process.env.REACT_APP_KAKAO_REST_API_KEY);

// 직접 API 호출 테스트
fetch('https://dapi.kakao.com/v2/local/search/keyword.json?query=경복궁&size=10', {
  headers: {
    'Authorization': 'KakaoAK c3b5dea6d228f84b42b45304208e3bb6'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🔄 백엔드 프록시 방식 (대안)

CORS 문제가 계속 발생하면 백엔드에서 프록시를 통해 API를 호출하는 방법도 있습니다.

