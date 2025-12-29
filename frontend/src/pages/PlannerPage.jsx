import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PlannerForm from "../components/planner/PlannerForm";
import MapView from "../components/planner/MapView";
import ComparisonPanel from "../components/planner/ComparisonPanel";
import { getRoutes } from "../api/routesApi";
import { touristSpots } from "../data/touristSpots";

// 북촌한옥마을 좌표 (고정 출발지)
const BUKCHON_START_LOCATION = {
  lat: 37.5831,
  lng: 126.9820,
  name: "북촌한옥마을",
  address: "서울특별시 종로구 계동길 37"
};

export default function PlannerPage() {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [season, setSeason] = useState("summer"); // summer | winter
  const [routes, setRoutes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 출발지는 북촌한옥마을로 고정
  const startLocation = BUKCHON_START_LOCATION;

  const onGenerate = async () => {
    if (selectedPlaces.length === 0) {
      alert("관광지를 하나 이상 선택해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await getRoutes({
        start: {
          lat: startLocation.lat,
          lng: startLocation.lng,
        },
        places: selectedPlaces,
        season,
      });
      setRoutes(result);
    } catch (e) {
      console.error(e);
      alert("경로 생성에 실패했어. (콘솔 확인)");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="page">
      <div className="topbar">
        <h1 style={{ margin: 0 }}>경로 만들기</h1>
        <Link to="/">
          <button className="btn btnGhost">홈으로</button>
        </Link>
      </div>

      <div className='grid-2'>
        {/* 왼쪽 */}
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <PlannerForm
              selectedPlaces={selectedPlaces}
              setSelectedPlaces={setSelectedPlaces}
              season={season}
              setSeason={setSeason}
              onGenerate={onGenerate}
              isLoading={isLoading}
            />
          </div>

          <div className="card">
            <MapView
              start={startLocation}
              selectedPlaces={selectedPlaces}
              routes={routes}
            />
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="card sticky">
          <ComparisonPanel routes={routes} />
        </div>
      </div>
    </div>
  );
}
