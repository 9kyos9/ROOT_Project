# Kakao SDK 403 Forbidden 에러 해결 가이드

## 🔴 에러 원인

**403 Forbidden** 에러는 다음 중 하나일 수 있습니다:

1. **플랫폼 도메인이 등록되지 않음**
2. **플랫폼 도메인 형식이 잘못됨**
3. **JavaScript 키가 잘못됨**
4. **도메인 등록 후 적용 시간이 필요함**

## ✅ 해결 방법

### 1. 플랫폼 도메인 정확히 등록

**Kakao Developers**에서:

1. 내 애플리케이션 선택
2. **앱 설정 > 플랫폼** 메뉴
3. **Web 플랫폼** 확인/등록

**중요**: 다음 형식으로 정확히 등록해야 합니다:

```
http://localhost:3000
http://127.0.0.1:3000
```

**주의사항**:
- ❌ `http://localhost:3000/` (끝에 슬래시 있으면 안됨)
- ❌ `http://localhost:3000/planner` (경로 포함하면 안됨)
- ✅ `http://localhost:3000` (정확히 이렇게만)

### 2. 도메인 등록 후 대기

도메인을 등록하거나 수정한 후:
- **1-2분 대기** (적용 시간 필요)
- 브라우저 **하드 리프레시** (`Cmd+Shift+R` 또는 `Ctrl+Shift+R`)
- 또는 브라우저 **완전히 종료 후 재시작**

### 3. JavaScript 키 확인

`.env` 파일에 올바른 키가 있는지 확인:
```bash
REACT_APP_KAKAO_JAVASCRIPT_KEY=5483aff8e53f6f10ac8da40b9bce4417
```

**Kakao Developers**에서:
- **앱 설정 > 앱 키** 메뉴
- **JavaScript 키** 확인
- 키가 일치하는지 확인

### 4. HTML에 직접 스크립트 추가 (현재 적용됨)

`index.html`에 직접 스크립트를 추가하는 방식으로 변경했습니다.
이 방식이 더 안정적입니다.

## 🔍 디버깅

브라우저 콘솔에서 확인:

```javascript
// SDK가 로드되었는지 확인
console.log(window.kakao);

// 스크립트 태그 확인
console.log(document.querySelector('script[src*="dapi.kakao.com"]'));
```

## 📝 변경 사항

1. `index.html`에 Kakao SDK 스크립트 직접 추가
2. `placeSearch.js`에서 동적 로드 방식 개선
3. 더 나은 에러 처리 및 로깅

## ⚠️ 여전히 403 에러가 발생하면

1. **플랫폼 도메인을 삭제하고 다시 등록**
2. **5분 정도 대기 후 재시도**
3. **시크릿 모드에서 테스트** (캐시 문제 제외)
4. **다른 브라우저에서 테스트**


