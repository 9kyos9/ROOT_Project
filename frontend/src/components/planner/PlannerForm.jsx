export default function PlannerForm({
  startMode,
  setStartMode,
  startInput,
  setStartInput,
  selectedPlaces,
  setSelectedPlaces,
  weights,
  setWeights,
  onGenerate,
  isLoading,
}) {
  const addMockPlace = () => {
    const next = {
      id: crypto.randomUUID(),
      name: `관광지 ${selectedPlaces.length + 1}`,
      lat: 37.5665 + Math.random() * 0.02,
      lng: 126.978 + Math.random() * 0.02,
    };
    setSelectedPlaces([...selectedPlaces, next]);
  };

  const removePlace = (id) => {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== id));
  };

  const updateWeight = (key, value) => {
    setWeights({ ...weights, [key]: value });
  };

  return (
    <div className="plannerForm">
      <h2 className="cardTitle">경로 설정</h2>

      {/* 출발지 */}
      <section className="formSection">
        <div className="sectionTitle">출발지</div>

        <div className="segmented">
          <button
            className={`segBtn ${startMode === "current" ? "active" : ""}`}
            onClick={() => setStartMode("current")}
          >
            현재 위치
          </button>
          <button
            className={`segBtn ${startMode === "custom" ? "active" : ""}`}
            onClick={() => setStartMode("custom")}
          >
            지정 위치
          </button>
        </div>

        {startMode === "custom" && (
          <input
            className="input"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            placeholder="주소 또는 (위도, 경도)"
          />
        )}
      </section>

      {/* 관광지 */}
      <section className="formSection">
        <div className="sectionTitle">관광지</div>

        <div className="row">
          <button className="btn btnGhost" onClick={addMockPlace}>
            관광지 추가 (임시)
          </button>
          <span className="muted small">
            * 나중에 검색 UI로 교체
          </span>
        </div>

        {selectedPlaces.length > 0 && (
          <div className="chips">
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
      </section>

      {/* 가중치 */}
      <section className="formSection">
        <div className="sectionTitle">가중치</div>

        {[
          { key: "scenery", label: "경치" },
          { key: "crowd", label: "혼잡도" },
          { key: "cost", label: "비용" },
        ].map((w) => (
          <div key={w.key} className="sliderRow">
            <div className="sliderHeader">
              <span>{w.label}</span>
              <span className="sliderValue">{weights[w.key]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={weights[w.key]}
              onChange={(e) => updateWeight(w.key, Number(e.target.value))}
            />
          </div>
        ))}
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
