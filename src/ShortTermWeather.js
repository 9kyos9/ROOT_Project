import React, { useState, useEffect } from 'react';

// ⚠️ 사용자가 제공한 API 키와 격자 좌표를 반영했습니다.
const SERVICE_KEY = encodeURIComponent('5297ae5429122e0b56cef39cd7ad0da87089357e66c37c006de3694900b28c1f');

// API 엔드포인트 (파이썬에서 사용하신 URL을 반영했습니다.)
const API_BASE_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

// --- 기상청 격자 좌표 변환 공식 ---
// LCC(Lambert Conformal Conic) 투영을 사용하는 복잡한 공식입니다.

const RE = 6371.00877; // 지구 반경 (km)
const GRID = 5.0;      // 격자 간격 (km)
const SLAT1 = 30.0;    // 표준 위도 1
const SLAT2 = 60.0;    // 표준 위도 2
const OLON = 126.0;    // 기준 경도
const OLAT = 38.0;     // 기준 위도
const XO = 43;         // 원점 X 좌표
const YO = 136;        // 원점 Y 좌표

function convertToGrid(lat, lon) {
    const DEGRAD = Math.PI / 180.0;
    //const RADDEG = 180.0 / Math.PI;

    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);

    // 사용자의 위도/경도 변환
    let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    // 최종 격자 좌표 (nx, ny) 계산
    const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

    return { nx, ny };
}

/**
 * 기상청 단기예보 API 호출을 위한 base_date와 base_time을 계산합니다.
 * API는 3시간 단위로 발표됩니다. (02, 05, 08, 11, 14, 17, 20, 23시 정각)
 */
function getBaseDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    let hour = now.getHours();
    let base_time = '';

    // 발표 시간을 기준으로 가장 최근의 시간을 찾습니다.
    if (hour >= 23) base_time = '2300';
    else if (hour >= 20) base_time = '2000';
    else if (hour >= 17) base_time = '1700';
    else if (hour >= 14) base_time = '1400';
    else if (hour >= 11) base_time = '1100';
    else if (hour >= 8) base_time = '0800';
    else if (hour >= 5) base_time = '0500';
    else if (hour >= 2) base_time = '0200';
    else base_time = '2300'; // 00시, 01시의 경우 전날 23시 발표 기준

    // 현재 시각이 발표 시간 기준보다 빠르다면, base_date를 전날로 설정합니다.
    let base_date = `${year}${month}${day}`;
    if (base_time === '2300' && now.getHours() < 2) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        base_date = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`;
    }

    return { base_date, base_time };
}

// 격자 데이터(item) 배열을 시간별 예보 객체로 변환하는 함수
function processForecastData(items) {
    const forecastMap = new Map();

    items.forEach(item => {
        const key = `${item.fcstDate}_${item.fcstTime}`;
        if (!forecastMap.has(key)) {
            forecastMap.set(key, {
                baseDate: item.baseDate,
                baseTime: item.baseTime,
                fcstDate: item.fcstDate,
                fcstTime: item.fcstTime
            });
        }

        // category (카테고리 코드)에 따라 값을 할당
        forecastMap.get(key)[item.category] = item.fcstValue;
    });

    return Array.from(forecastMap.values());
}

// 하늘 상태(SKY) 코드 변환
function getSkyDescription(code) {
    if (!code) return '정보 없음';
    switch (String(code)) {
        case '1': return '맑음';
        case '3': return '구름 많음';
        case '4': return '흐림';
        default: return `코드 ${code}`;
    }
}
// 풍향(VEC) 코드 변환
function getWindDirection(deg) {
    if (deg === undefined || deg === null) return '정보 없음';

    // 숫자를 정수로 변환 후 22.5도를 더해 반올림 처리
    const val = parseInt(deg) + 22.5;
    const directions = [
        "북", "북북동", "북동", "동북동", "동", "동남동", "남동", "남남동",
        "남", "남남서", "남서", "서남서", "서", "서북서", "북서", "북북서", "북"
    ];

    // 360도를 16방위로 나눈 값으로 인덱스를 계산
    const index = Math.floor(val / 45 * 2 + 0.5) % 16;

    return directions[index];
}

// 강수 형태(PTY) 코드 변환
function getPtyDescription(code) {
    if (!code) return '강수 없음';
    switch (String(code)) {
        case '0': return '강수 없음';
        case '1': return '비';
        case '2': return '비/눈';
        case '3': return '눈';
        case '4': return '소나기';
        case '5': return '빗방울';
        case '6': return '빗방울/눈날림';
        case '7': return '눈날림';
        default: return `코드 ${code}`;
    }
}


function ShortTermWeather() {
    // NX, NY를 동적으로 저장하기 위한 새로운 상태 추가
    const [coords, setCoords] = useState({ nx: null, ny: null });
    const [weatherList, setWeatherList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState("현재 위치"); // 위치 이름 표시용

    useEffect(() => {
        // 1. 브라우저의 Geolocation API를 사용하여 현재 위치를 가져옵니다.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // 2. 위도/경도를 기상청 격자 좌표로 변환
                    const { nx, ny } = convertToGrid(lat, lon);
                    setCoords({ nx, ny }); // 변환된 좌표를 상태에 저장

                    // (선택) 위치 정보를 역지오코딩하여 도시 이름을 가져올 수 있지만,
                    // 여기서는 간단히 좌표만 표시합니다.
                    setLocationName(`(${nx}, ${ny})`);
                },
                (error) => {
                    // 사용자가 위치 권한을 거부했거나 오류가 발생한 경우
                    setError("위치 정보를 가져오는 데 실패했습니다. (권한 거부 또는 오류)");
                    setLoading(false);
                    setCoords({ nx: 60, ny: 127 }); // 기본값(서울)으로 대체하거나 오류 표시
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setError("이 브라우저는 위치 정보(Geolocation)를 지원하지 않습니다.");
            setLoading(false);
        }
    }, []); // 컴포넌트 마운트 시 한 번만 위치 정보를 요청합니다.

    // ----------------------------------------------------
    // 3. 날씨 데이터를 가져오는 로직 (위치 정보가 확보된 후에만 실행)
    // --- [Hook 2] 좌표(coords)가 설정된 후 API 호출 ---
    useEffect(() => {
        // 좌표가 아직 설정되지 않았거나 에러가 있는 경우 API 호출을 하지 않습니다.
        if (coords.nx === null || coords.ny === null || error) {
            return;
        }

        const fetchWeather = async () => {
            setLoading(true);
            const { base_date, base_time } = getBaseDateTime();

            // ✅ 수정된 부분: coords.nx, coords.ny를 사용
            const API_URL = `${API_BASE_URL}?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${coords.nx}&ny=${coords.ny}`;

            try {
                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }

                const data = await response.json();

                if (data.response.header.resultCode !== '00') {
                    throw new Error(`API Error: ${data.response.header.resultMsg}`);
                }

                if (!data.response.body || !data.response.body.items || data.response.body.items.item.length === 0) {
                    setWeatherList([]);
                    return;
                }

                const items = data.response.body.items.item;
                const processedData = processForecastData(items);
                console.log('가공된 날씨 데이터 VEC 확인):', processedData.slice(0, 2));
                setWeatherList(processedData);
                setError(null);

            } catch (e) {
                setError("날씨 데이터를 불러오는 데 실패했습니다: " + e.message);
                setWeatherList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [coords]); // coords 상태가 업데이트될 때 실행

    // 1. 로딩 중 표시
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>공공데이터 포털 날씨 정보 로딩 중...</div>;
    }

    // 2. 에러 발생 시 표시
    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>⚠️ 에러: {error}</div>;
    }

    // 3. 데이터가 성공적으로 로드되었을 때 표시
    if (weatherList.length === 0) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>날씨 정보를 찾을 수 없습니다. (기준 날짜: {getBaseDateTime().base_date}, 시간: {getBaseDateTime().base_time})</div>;
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #0056b3', borderRadius: '8px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', color: '#0056b3' }}>
                {/* ⬇️⬇️⬇️ 이 부분을 아래와 같이 수정합니다 ⬇️⬇️⬇️ */}
                {locationName} 단기 예보
            </h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
                기준 시각: {weatherList[0].baseDate.slice(0, 4)}년 {weatherList[0].baseDate.slice(4, 6)}월 {weatherList[0].baseDate.slice(6, 8)}일 / {weatherList[0].baseTime.slice(0, 2)}시 발표
            </p>

            {/* 상위 5개 시간대의 예보만 표시 */}
            {weatherList.slice(0, 5).map((forecast, index) => (
                <div key={index} style={{ borderBottom: index < 4 ? '1px dotted #ccc' : 'none', padding: '10px 0', marginTop: '10px' }}>
                    <h4 style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                        {forecast.fcstDate.slice(4, 6)}/{forecast.fcstDate.slice(6, 8)} {forecast.fcstTime.slice(0, 2)}시 예보
                    </h4>
                    <p style={{ margin: '5px 0' }}>
                        🌡️ 기온: <strong>{forecast.TMP || '-'}°C</strong> |
                        ☁️ 하늘 상태: {getSkyDescription(forecast.SKY)}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        ☔ 강수 형태: {getPtyDescription(forecast.PTY)}
                    </p>
                    {/* ⬇️⬇️⬇️ 이 부분이 새롭게 추가/수정될 부분입니다 ⬇️⬇️⬇️ */}
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                        🌬️ 풍향/풍속: {getWindDirection(forecast.VEC)} ({forecast.WSD || '-'} m/s)
                    </p>
                    {/* ⬆️⬆️⬆️ 추가/수정 끝 ⬆️⬆️⬆️ */}
                </div>
            ))}
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>* 예시로 가장 가까운 5개 시간대의 예보만 표시했습니다. (총 {weatherList.length}개 예보 데이터 로드)</p>
        </div>
    );
}

export default ShortTermWeather;