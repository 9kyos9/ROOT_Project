// src/api/routesApi.js
// 지금은 프론트 작업용 mock.
// 나중에 FastAPI 붙일 때 이 파일만 교체하면 됨.

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @typedef {Object} Place
 * @property {string} id
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} RoutesInput
 * @property {{mode: "current"|"custom", value?: string}} start
 * @property {Place[]} places
 * @property {{[key: string]: number}} weights
 */

/**
 * @param {RoutesInput} input
 */
export async function getRoutes(input) {
  // mock 딜레이
  await sleep(600);

  // places가 없으면 에러처럼 처리(실제 API도 이런 검증을 하게 될 것)
  if (!input?.places?.length) {
    throw new Error("places is empty");
  }

  // 임시 결과(나중에 FastAPI 응답과 같은 shape로 유지)
  return {
    recommended: {
      distanceKm: 12.4,
      durationMin: 46,
      score: 83,
      polyline: [
        [37.5665, 126.978],
        [37.57, 126.985],
      ],
      stops: input.places,
    },
    shortest: {
      distanceKm: 10.6,
      durationMin: 38,
      score: 70,
      polyline: [
        [37.5665, 126.978],
        [37.569, 126.982],
      ],
      stops: input.places,
    },
  };
}
