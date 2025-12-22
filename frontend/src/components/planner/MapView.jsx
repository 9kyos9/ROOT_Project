import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";

// Leaflet 기본 마커 아이콘 깨짐 방지
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ start, selectedPlaces, routes }) {
  const center = [37.5665, 126.978]; // 서울 시청 (초기 중심)

  const recommendedLine =
    routes?.recommended?.polyline?.map(([lat, lng]) => [lat, lng]) ?? [];

  const shortestLine =
    routes?.shortest?.polyline?.map(([lat, lng]) => [lat, lng]) ?? [];

  return (
    <div>
      <h2 style={{ margin: "0 0 8px 0" }}>지도</h2>

      <MapContainer
        center={center}
        zoom={13}
        style={{
          height: 420,
          width: "100%",
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 출발지 마커 (현재는 중심점으로 표시) */}
        {start && <Marker position={center} />}

        {/* 관광지 마커 */}
        {selectedPlaces.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} />
        ))}

        {/* 추천 경로 */}
        {recommendedLine.length > 0 && (
          <Polyline positions={recommendedLine} color="blue" weight={4} />
        )}

        {/* 최단 경로 */}
        {shortestLine.length > 0 && (
          <Polyline
            positions={shortestLine}
            color="gray"
            weight={3}
            dashArray="6"
          />
        )}
      </MapContainer>
    </div>
  );
}
