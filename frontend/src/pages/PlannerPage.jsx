import { useState } from "react";
import { Link } from "react-router-dom";
import PlannerForm from "../components/planner/PlannerForm";
import MapView from "../components/planner/MapView";
import ComparisonPanel from "../components/planner/ComparisonPanel";
import { getRoutes } from "../api/routesApi";

export default function PlannerPage() {
  const [startMode, setStartMode] = useState("current"); // current | custom
  const [startInput, setStartInput] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [weights, setWeights] = useState({
    scenery: 5,
    crowd: 5,
    cost: 5,
  });

  const [routes, setRoutes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const start =
    startMode === "current"
      ? { mode: "current" }
      : { mode: "custom", value: startInput };

  const onGenerate = async () => {
  setIsLoading(true);

    try {
      const result = await getRoutes({
        start,
        places: selectedPlaces,
        weights,
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
              startMode={startMode}
              setStartMode={setStartMode}
              startInput={startInput}
              setStartInput={setStartInput}
              selectedPlaces={selectedPlaces}
              setSelectedPlaces={setSelectedPlaces}
              weights={weights}
              setWeights={setWeights}
              onGenerate={onGenerate}
              isLoading={isLoading}
            />
          </div>

          <div className="card">
            <MapView
              start={start}
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
