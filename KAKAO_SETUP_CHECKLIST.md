# Kakao JavaScript SDK 설정 체크리스트

## ✅ 현재 설정 확인

이미지에서 확인된 설정:
- **JavaScript 키**: `5483aff8e53f6f10ac8da40b9bce4417` ✅
- **JavaScript SDK 도메인**: 
  - `http://localhost:3000` ✅
  - `http://127.0.0.1:3000` ✅

## 🔧 추가 확인 사항

### 1. 도메인 등록 후 적용 시간

도메인을 등록하거나 수정한 직후에는:
- **1-2분 대기** 필요 (Kakao 서버에 적용 시간)
- 브라우저 **하드 리프레시** (`Cmd+Shift+R` 또는 `Ctrl+Shift+R`)

### 2. 브라우저 캐시

개발 중에는 캐시가 문제가 될 수 있습니다:
- 개발자 도구(F12) > Network 탭 > "Disable cache" 체크
- 또는 시크릿 모드에서 테스트

### 3. 프론트엔드 서버 재시작

`.env` 파일이나 `index.html`을 수정했다면:
```bash
./stop.sh
./start-frontend.sh
```

### 4. 브라우저 콘솔에서 직접 테스트

브라우저 콘솔(F12)에서:
```javascript
// SDK가 로드되었는지 확인
console.log(window.kakao);

// 스크립트 태그 확인
console.log(document.querySelector('script[src*="dapi.kakao.com"]'));

// 직접 Places 서비스 테스트
if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
  const ps = new window.kakao.maps.services.Places();
  ps.keywordSearch('경복궁', (data, status) => {
    console.log('검색 결과:', status, data);
  });
}
```

## 🚨 여전히 403 에러가 발생하면

1. **도메인 삭제 후 재등록**
   - 기존 도메인 삭제
   - 다시 추가: `http://localhost:3000`
   - 저장 후 2-3분 대기

2. **시크릿 모드에서 테스트**
   - 캐시 문제 제외

3. **다른 브라우저에서 테스트**
   - Chrome, Firefox, Safari 등

4. **Kakao Developers에서 키 확인**
   - JavaScript 키가 활성화되어 있는지 확인
   - 앱 상태가 정상인지 확인


