/**
 * 종로구 주요 관광지 목록
 * 각 관광지의 위도/경도 정보 포함
 */

export const touristSpots = [
  {
    id: "gyeongbokgung",
    name: "경복궁",
    address: "서울특별시 종로구 사직로 161",
    lat: 37.5796,
    lng: 126.9770,
    category: "궁궐",
    description: "조선왕조 제1의 법궁"
  },
  {
    id: "changdeokgung",
    name: "창덕궁",
    address: "서울특별시 종로구 율곡로 99",
    lat: 37.5794,
    lng: 126.9910,
    category: "궁궐",
    description: "유네스코 세계문화유산"
  },
  {
    id: "bukchon",
    name: "북촌한옥마을",
    address: "서울특별시 종로구 계동길 37",
    lat: 37.5831,
    lng: 126.9820,
    category: "한옥마을",
    description: "전통 한옥이 밀집된 마을"
  },
  {
    id: "insadong",
    name: "인사동",
    address: "서울특별시 종로구 인사동길",
    lat: 37.5735,
    lng: 126.9868,
    category: "거리",
    description: "전통 문화와 예술의 거리"
  },
  {
    id: "jongmyo",
    name: "종묘",
    address: "서울특별시 종로구 종로 157",
    lat: 37.5735,
    lng: 126.9947,
    category: "사직",
    description: "조선왕조의 왕실 사당"
  },
  {
    id: "gwanghwamun",
    name: "광화문광장",
    address: "서울특별시 종로구 세종대로 172",
    lat: 37.5716,
    lng: 126.9766,
    category: "광장",
    description: "서울의 중심 광장"
  },
  {
    id: "cheonggyecheon",
    name: "청계천",
    address: "서울특별시 종로구 청계천로",
    lat: 37.5663,
    lng: 126.9779,
    category: "공원",
    description: "도심 속 자연 공원"
  },
  {
    id: "dongdaemun",
    name: "동대문디자인플라자",
    address: "서울특별시 중구 을지로 281",
    lat: 37.5663,
    lng: 127.0093,
    category: "건축물",
    description: "건축 명소 DDP"
  },
  {
    id: "nseoultower",
    name: "N서울타워",
    address: "서울특별시 용산구 남산공원길 105",
    lat: 37.5512,
    lng: 126.9882,
    category: "전망대",
    description: "서울의 상징 타워"
  },
  {
    id: "myeongdong",
    name: "명동",
    address: "서울특별시 중구 명동길",
    lat: 37.5636,
    lng: 126.9826,
    category: "쇼핑",
    description: "대표적인 쇼핑 거리"
  },
  {
    id: "gwangjang",
    name: "광장시장",
    address: "서울특별시 종로구 예지동 2-1",
    lat: 37.5701,
    lng: 126.9999,
    category: "시장",
    description: "전통 시장"
  },
  {
    id: "samcheongdong",
    name: "삼청동",
    address: "서울특별시 종로구 삼청로",
    lat: 37.5840,
    lng: 126.9818,
    category: "거리",
    description: "문화예술 거리"
  },
  {
    id: "seoulcityhall",
    name: "서울시청",
    address: "서울특별시 중구 세종대로 110",
    lat: 37.5663,
    lng: 126.9780,
    category: "건축물",
    description: "서울시청사"
  },
  {
    id: "deoksugung",
    name: "덕수궁",
    address: "서울특별시 중구 세종대로 99",
    lat: 37.5658,
    lng: 126.9750,
    category: "궁궐",
    description: "조선왕조의 궁궐"
  },
  {
    id: "jogyesa",
    name: "조계사",
    address: "서울특별시 종로구 우정국로 55",
    lat: 37.5734,
    lng: 126.9808,
    category: "사찰",
    description: "대한불교조계종 총본산"
  }
];

/**
 * 카테고리별로 관광지 그룹화
 */
export const spotsByCategory = touristSpots.reduce((acc, spot) => {
  if (!acc[spot.category]) {
    acc[spot.category] = [];
  }
  acc[spot.category].push(spot);
  return acc;
}, {});

/**
 * 관광지 검색 (이름 또는 주소로)
 */
export function searchTouristSpots(query) {
  if (!query || query.trim() === "") {
    return touristSpots;
  }
  
  const lowerQuery = query.toLowerCase();
  return touristSpots.filter(spot => 
    spot.name.toLowerCase().includes(lowerQuery) ||
    spot.address.toLowerCase().includes(lowerQuery) ||
    spot.category.toLowerCase().includes(lowerQuery) ||
    (spot.description && spot.description.toLowerCase().includes(lowerQuery))
  );
}

