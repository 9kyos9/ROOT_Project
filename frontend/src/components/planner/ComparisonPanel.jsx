function MetricCard({ label, rec, sh, unit, better }) {
  const delta =
    rec != null && sh != null ? Number((rec - sh).toFixed(1)) : null;

  const deltaSign =
    delta == null ? "" : delta > 0 ? `+${delta}` : `${delta}`;

  const deltaClass =
    delta == null
      ? ""
      : better === "higher"
      ? delta > 0
        ? "deltaGood"
        : "deltaBad"
      : better === "lower"
      ? delta < 0
        ? "deltaGood"
        : "deltaBad"
      : "";

  return (
    <div className="metricCard">
      <div className="metricLabel">{label}</div>

      <div className="metricValues">
        <div className="metricRec">
          <div className="metricValue">{rec ?? "-"}</div>
          <div className="metricUnit">{unit}</div>
          <div className="metricSub">추천</div>
        </div>

        <div className="metricVs">vs</div>

        <div className="metricShort">
          <div className="metricValue muted">{sh ?? "-"}</div>
          <div className="metricUnit">{unit}</div>
          <div className="metricSub muted">최단</div>
        </div>
      </div>

      {delta != null && (
        <div className={`metricDelta ${deltaClass}`}>
          차이 {deltaSign}
          {unit}
        </div>
      )}
    </div>
  );
}

export default function ComparisonPanel({ routes }) {
  const rec = routes?.recommended;
  const sh = routes?.shortest;

  return (
    <div className="comparisonPanel">
      <h2 className="cardTitle">경로 비교</h2>

      {!routes && (
        <div className="muted small">
          경로를 생성하면 추천 경로와 최단 경로의 차이를 확인할 수 있어.
        </div>
      )}

      {routes && (
        <div className="metrics">
          <MetricCard
            label="거리"
            rec={rec?.distanceKm}
            sh={sh?.distanceKm}
            unit="km"
            better="lower"
          />

          <MetricCard
            label="시간"
            rec={rec?.durationMin}
            sh={sh?.durationMin}
            unit="min"
            better="lower"
          />

          <MetricCard
            label="점수"
            rec={rec?.score}
            sh={sh?.score}
            unit=""
            better="higher"
          />

          <div className="panelNote muted">
            * 추천 경로는 여러 요소 가중치를 반영한 결과이며,
            최단 경로는 이동 거리/시간 기준입니다.
          </div>
        </div>
      )}
    </div>
  );
}
