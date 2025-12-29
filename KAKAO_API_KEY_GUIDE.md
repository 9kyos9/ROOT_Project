# Kakao Map API 키 선택 가이드

## 🔑 키 종류별 용도

### REST API 키 (현재 사용 중 ✅)

**용도:**
- ✅ 장소 검색 (위도/경도 가져오기)
- ✅ 주소 → 좌표 변환 (Geocoding)
- ✅ 좌표 → 주소 변환 (Reverse Geocoding)
- ✅ 서버 사이드 API 호출

**사용 방법:**
```javascript
// 브라우저에서 직접 호출
fetch('https://dapi.kakao.com/v2/local/search/keyword.json?query=경복궁', {
  headers: {
    'Authorization': 'KakaoAK YOUR_REST_API_KEY'
  }
})
```

**필수 설정:**
- ⚠️ **플랫폼 도메인 등록 필수** (브라우저에서 사용 시)
  - `http://localhost:3000` 등록 필요
  - 등록하지 않으면 CORS 에러 발생

### JavaScript 키

**용도:**
- ✅ 지도 표시 (카카오 지도 SDK 사용)
- ✅ 지도 위 마커 표시
- ✅ 지도 상호작용 (줌, 팬 등)

**사용 방법:**
```html
<!-- HTML에 스크립트 추가 -->
<script type="text/javascript" 
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_KEY&libraries=services">
</script>
```

**필수 설정:**
- 플랫폼 도메인 등록 필요

## 📍 현재 프로젝트 상황

### 현재 사용 중: REST API 키 ✅

현재 코드는 **REST API 키**를 사용하고 있으며, 이는 **올바른 선택**입니다.

**이유:**
1. 장소 검색 API (`/v2/local/search/keyword.json`)는 REST API 키 필요
2. 주소 변환 API (`/v2/local/search/address.json`)도 REST API 키 필요
3. 위도/경도 가져오기에는 REST API가 적합

### 필요한 설정

**REST API 키를 브라우저에서 사용하려면:**

1. **Kakao Developers** 접속
2. **내 애플리케이션** 선택
3. **앱 설정 > 플랫폼** 메뉴
4. **Web 플랫폼 등록**
5. 다음 도메인 추가:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```

## 🔄 대안: JavaScript SDK 사용

만약 플랫폼 도메인 등록이 어렵다면, JavaScript SDK를 사용할 수도 있습니다:

```javascript
// JavaScript SDK로 장소 검색
var ps = new kakao.maps.services.Places();
ps.keywordSearch('경복궁', function(data, status) {
  if (status === kakao.maps.services.Status.OK) {
    var place = data[0];
    console.log('위도:', place.y);
    console.log('경도:', place.x);
  }
});
```

하지만 현재 REST API 방식이 더 간단하고 유연합니다.

## ✅ 결론

**위치 검색(위도/경도 가져오기)에는 REST API 키를 사용하세요.**

현재 설정이 올바릅니다. 다만 **플랫폼 도메인 등록**만 확인하면 됩니다!

