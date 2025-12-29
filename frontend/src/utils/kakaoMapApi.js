/**
 * Kakao Map API 유틸리티 (향후 확장용)
 * 
 * 현재는 사용하지 않지만, 추후 카카오 맵 API를 사용할 때를 위해 분리해둠
 */

const KAKAO_JAVASCRIPT_KEY = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY || "5483aff8e53f6f10ac8da40b9bce4417";

// Kakao SDK 로드 확인
let kakaoLoaded = false;
let loadingPromise = null;

/**
 * Kakao SDK 로드 (HTML에 이미 스크립트가 추가되어 있으므로 대기만 함)
 */
function loadKakaoSDK() {
  // 이미 로드되어 있는지 확인
  if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
    kakaoLoaded = true;
    return Promise.resolve();
  }

  // 이미 로딩 중이면 기존 Promise 반환
  if (loadingPromise) {
    return loadingPromise;
  }

  console.log("Kakao SDK 로드 대기 중...");

  // HTML에 스크립트가 있는지 확인
  const existingScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
  
  if (!existingScript) {
    // 스크립트가 없으면 동적으로 추가
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services`;
    script.async = true;
    document.head.appendChild(script);
    console.log("SDK 스크립트를 동적으로 추가했습니다.");
  }

  // SDK가 로드될 때까지 대기
  loadingPromise = new Promise((resolve, reject) => {
    let checkCount = 0;
    const maxChecks = 200; // 20초 (100ms * 200)
    
    const checkInterval = setInterval(() => {
      checkCount++;
      
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        clearInterval(checkInterval);
        kakaoLoaded = true;
        loadingPromise = null;
        console.log("Kakao SDK 로드 완료!");
        resolve();
        return;
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
        loadingPromise = null;
        console.error("Kakao SDK 로드 시간 초과");
        reject(new Error("Kakao SDK 로드 시간 초과. 플랫폼 도메인 설정을 확인하세요."));
      }
    }, 100);
  });
  
  return loadingPromise;
}

/**
 * Kakao Map API로 장소 검색 (JavaScript SDK 사용)
 * @param {string} query - 검색어
 * @returns {Promise<Array>} 검색 결과 배열
 */
export async function searchPlace(query) {
  if (!query || query.trim() === "") {
    return [];
  }

  try {
    console.log("장소 검색 시작:", query);
    // SDK 로드
    await loadKakaoSDK();

    // Places 서비스 사용
    const ps = new window.kakao.maps.services.Places();

    return new Promise((resolve, reject) => {
      ps.keywordSearch(query, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const results = data.map((doc) => ({
            id: doc.id,
            name: doc.place_name,
            address: doc.address_name,
            roadAddress: doc.road_address_name || doc.address_name,
            lat: parseFloat(doc.y),
            lng: parseFloat(doc.x),
            category: doc.category_name,
          }));
          console.log("검색 결과:", results.length, "개");
          resolve(results);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          console.log("검색 결과가 없습니다.");
          resolve([]);
        } else {
          console.error("장소 검색 오류 상태:", status);
          reject(new Error(`검색 중 오류가 발생했습니다: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error("장소 검색 오류:", error);
    throw error;
  }
}

/**
 * 주소를 좌표로 변환 (Geocoding) - JavaScript SDK 사용
 * @param {string} address - 주소
 * @returns {Promise<{lat: number, lng: number} | null>} 좌표
 */
export async function addressToCoords(address) {
  if (!address || address.trim() === "") {
    return null;
  }

  try {
    // SDK 로드
    await loadKakaoSDK();

    // Geocoder 서비스 사용
    const geocoder = new window.kakao.maps.services.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          if (result && result.length > 0) {
            resolve({
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x),
            });
          } else {
            resolve(null);
          }
        } else {
          console.error("주소 변환 오류:", status);
          reject(new Error(`주소 변환 중 오류가 발생했습니다: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error("주소 변환 오류:", error);
    throw error;
  }
}

