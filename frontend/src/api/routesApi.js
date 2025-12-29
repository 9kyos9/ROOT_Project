// src/api/routesApi.js
// FastAPI 백엔드 API 호출

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * @typedef {Object} Place
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} RoutesInput
 * @property {{lat: number, lng: number}} start
 * @property {Place[]} places
 * @property {string} season
 */

/**
 * @param {RoutesInput} input
 */
export async function getRoutes(input) {
  // places가 없으면 에러 처리
  if (!input?.places?.length) {
    throw new Error("places is empty");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/routes/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: input.start,
        places: input.places,
        season: input.season || "summer",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("경로 계산 API 오류:", error);
    throw error;
  }
}
