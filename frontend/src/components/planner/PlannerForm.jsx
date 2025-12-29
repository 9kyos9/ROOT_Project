import { useState, useEffect } from "react";
import { touristSpots, searchTouristSpots } from "../../data/touristSpots";

export default function PlannerForm({
  selectedPlaces,
  setSelectedPlaces,
  season,
  setSeason,
  onGenerate,
  isLoading,
}) {
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [filteredSpots, setFilteredSpots] = useState(touristSpots);
  const [showSpotList, setShowSpotList] = useState(false);

  // 관광지 필터링
  useEffect(() => {
    if (placeSearchQuery.trim()) {
      const filtered = searchTouristSpots(placeSearchQuery);
      setFilteredSpots(filtered);
      setShowSpotList(true);
    } else {
      setFilteredSpots(touristSpots);
      setShowSpotList(false);
    }
  }, [placeSearchQuery]);

  // 관광지 추가
  const addPlace = (place) => {
    // 이미 추가된 관광지인지 확인
    if (selectedPlaces.some(p => p.id === place.id)) {
      alert("이미 추가된 관광지입니다.");
      return;
    }
    
    const newPlace = {
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      address: place.address,
    };
    setSelectedPlaces([...selectedPlaces, newPlace]);
    setPlaceSearchQuery("");
    setShowSpotList(false);
  };

  // 관광지 제거
  const removePlace = (id) => {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== id));
  };

  return (
    <div className="plannerForm">
      <h2 className="cardTitle">경로 설정</h2>

      {/* 출발지 (고정) */}
      <section className="formSection">
        <div className="sectionTitle">출발지</div>
        <div style={{ 
          padding: "12px", 
          backgroundColor: "#f5f5f5", 
          borderRadius: "4px",
          marginTop: 8
        }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>북촌한옥마을</div>
          <div style={{ fontSize: "0.875rem", color: "#666" }}>
            서울특별시 종로구 계동길 37
          </div>
          <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}>
            (고정 출발지)
          </div>
        </div>
      </section>

      {/* 관광지 */}
      <section className="formSection">
        <div className="sectionTitle">관광지</div>

        <div style={{ position: "relative" }}>
          <input
            className="input"
            value={placeSearchQuery}
            onChange={(e) => setPlaceSearchQuery(e.target.value)}
            onFocus={() => setShowSpotList(true)}
            placeholder="관광지 검색 또는 목록에서 선택 (예: 경복궁, 북촌)"
            style={{ marginBottom: 0 }}
          />
          
          {/* 관광지 목록 드롭다운 */}
          {showSpotList && filteredSpots.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                maxHeight: "300px",
                overflowY: "auto",
                zIndex: 1000,
                marginTop: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onMouseLeave={() => {
                // 포커스가 없을 때만 닫기
                if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                  setShowSpotList(false);
                }
              }}
            >
              {filteredSpots.map((spot) => {
                const isSelected = selectedPlaces.some(p => p.id === spot.id);
                return (
                  <div
                    key={spot.id}
                    onClick={() => {
                      if (!isSelected) {
                        addPlace(spot);
                      }
                    }}
                    style={{
                      padding: "12px",
                      cursor: isSelected ? "not-allowed" : "pointer",
                      borderBottom: "1px solid #eee",
                      backgroundColor: isSelected ? "#f0f0f0" : "white",
                      opacity: isSelected ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? "#f0f0f0" : "white";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                          {spot.name}
                          {isSelected && <span style={{ marginLeft: 8, color: "#666", fontSize: "0.875rem" }}>(추가됨)</span>}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#666" }}>
                          {spot.address}
                        </div>
                        {spot.description && (
                          <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>
                            {spot.description}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginLeft: 8 }}>
                        {spot.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showSpotList && filteredSpots.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                padding: "12px",
                zIndex: 1000,
                marginTop: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ color: "#999", fontSize: "0.875rem" }}>
                검색 결과가 없습니다.
              </div>
            </div>
          )}
        </div>

        {selectedPlaces.length > 0 && (
          <div className="chips" style={{ marginTop: 12 }}>
            {selectedPlaces.map((p) => (
              <span key={p.id} className="chip">
                {p.name}
                <button
                  className="chipRemove"
                  onClick={() => removePlace(p.id)}
                  aria-label="remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="muted small" style={{ marginTop: 8 }}>
          총 {touristSpots.length}개의 관광지 중 {selectedPlaces.length}개 선택됨
        </div>
      </section>

      {/* 계절 선택 */}
      <section className="formSection">
        <div className="sectionTitle">계절</div>

        <div className="segmented">
          <button
            className={`segBtn ${season === "summer" ? "active" : ""}`}
            onClick={() => setSeason("summer")}
          >
            여름
          </button>
          <button
            className={`segBtn ${season === "winter" ? "active" : ""}`}
            onClick={() => setSeason("winter")}
          >
            겨울
          </button>
        </div>

        <div className="muted small" style={{ marginTop: 8 }}>
          {season === "summer"
            ? "여름: 그늘, 풍속, 무더위 쉼터, 관광지를 우선 고려합니다"
            : "겨울: 햇빛, 풍속, 길거리 먹거리, 관광지를 우선 고려합니다"}
        </div>
      </section>

      {/* 액션 */}
      <div className="formActions">
        <button
          className="btn btnPrimary full"
          onClick={onGenerate}
          disabled={isLoading || selectedPlaces.length === 0}
        >
          {isLoading ? "경로 생성 중..." : "경로 생성"}
        </button>

        {selectedPlaces.length === 0 && (
          <div className="hint muted">
            관광지를 하나 이상 추가해줘.
          </div>
        )}
      </div>
    </div>
  );
}
