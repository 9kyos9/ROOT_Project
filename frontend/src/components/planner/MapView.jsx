import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

// Leaflet 기본 마커 아이콘 깨짐 방지
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 출발지 마커 아이콘 (빨간색)
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 목적지 마커 아이콘 (초록색)
const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 관광지 마커 아이콘 (파란색)
const placeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 지도 범위 자동 조정 컴포넌트
function MapBounds({ bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }, [map, bounds]);
  
  return null;
}

export default function MapView({ start, selectedPlaces, routes }) {
  // polyline 좌표 변환: 백엔드에서 (lat, lon) 튜플로 오는 것을 [lat, lng] 배열로 변환
  const recommendedLine = useMemo(() => {
    if (!routes?.recommended?.polyline) return [];
    
    return routes.recommended.polyline.map((coord) => {
      // 튜플 형식 (lat, lon) 또는 배열 형식 [lat, lon]
      if (Array.isArray(coord)) {
        return coord.length >= 2 ? [coord[0], coord[1]] : null;
      }
      // 객체 형식 {lat, lng} 또는 {lat, lon}
      if (typeof coord === 'object' && coord !== null) {
        return coord.lat !== undefined && coord.lng !== undefined 
          ? [coord.lat, coord.lng]
          : coord.lat !== undefined && coord.lon !== undefined
          ? [coord.lat, coord.lon]
          : null;
      }
      return null;
    }).filter(coord => coord !== null);
  }, [routes?.recommended?.polyline]);

  // 최단 경로는 현재 사용하지 않음 (추천 경로만 표시)
  // const shortestLine = useMemo(() => {
  //   if (!routes?.shortest?.polyline) return [];
  //   
  //   return routes.shortest.polyline.map((coord) => {
  //     if (Array.isArray(coord)) {
  //       return coord.length >= 2 ? [coord[0], coord[1]] : null;
  //     }
  //     if (typeof coord === 'object' && coord !== null) {
  //       return coord.lat !== undefined && coord.lng !== undefined 
  //         ? [coord.lat, coord.lng]
  //         : coord.lat !== undefined && coord.lon !== undefined
  //         ? [coord.lat, coord.lon]
  //         : null;
  //     }
  //     return null;
  //   }).filter(coord => coord !== null);
  // }, [routes?.shortest?.polyline]);

  // 지도 범위 계산 (모든 마커와 경로를 포함)
  const bounds = useMemo(() => {
    const allPoints = [];
    
    // 출발지
    if (start && start.lat && start.lng) {
      allPoints.push([start.lat, start.lng]);
    }
    
    // 관광지
    selectedPlaces.forEach(place => {
      if (place.lat && place.lng) {
        allPoints.push([place.lat, place.lng]);
      }
    });
    
    // 경로 좌표 (추천 경로만)
    recommendedLine.forEach(coord => {
      if (coord && coord.length >= 2) {
        allPoints.push(coord);
      }
    });
    
    if (allPoints.length === 0) {
      return null;
    }
    
    // 최소/최대 좌표 계산
    const lats = allPoints.map(p => p[0]);
    const lngs = allPoints.map(p => p[1]);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  }, [start, selectedPlaces, recommendedLine]);

  // 지도 중심 결정
  const center = useMemo(() => {
    if (start && start.lat && start.lng) {
      return [start.lat, start.lng];
    }
    if (selectedPlaces.length > 0) {
      return [selectedPlaces[0].lat, selectedPlaces[0].lng];
    }
    return [37.5665, 126.978]; // 서울 시청
  }, [start, selectedPlaces]);

  return (
    <div>
      <h2 style={{ margin: "0 0 8px 0" }}>지도</h2>
      
      {/* 경로 정보 표시 */}
      {routes?.recommended && (
        <div style={{ 
          marginBottom: 8, 
          padding: 8, 
          backgroundColor: "#f5f5f5", 
          borderRadius: 4,
          fontSize: "0.875rem"
        }}>
          <div>
            <span style={{ fontWeight: "bold", color: "#0066cc" }}>추천 경로:</span>{" "}
            {routes.recommended.distanceKm}km · {routes.recommended.durationMin}분 · 
            점수: {routes.recommended.score?.toFixed(1) || "N/A"}
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={bounds ? undefined : 13}
        style={{
          height: 420,
          width: "100%",
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
        key={JSON.stringify([center, bounds])} // 중심점이나 범위가 변경되면 지도 재렌더링
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 지도 범위 자동 조정 */}
        {bounds && <MapBounds bounds={bounds} />}

        {/* 출발지 마커 (빨간색) */}
        {start && start.lat && start.lng && (
          <Marker position={[start.lat, start.lng]} icon={startIcon}>
            <Popup>
              <div style={{ fontWeight: "bold", color: "#dc3545" }}>출발지</div>
              {start.lat.toFixed(6)}, {start.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* 관광지 마커 (파란색) */}
        {selectedPlaces.map((p, index) => (
          <Marker key={p.id || index} position={[p.lat, p.lng]} icon={placeIcon}>
            <Popup>
              <div style={{ fontWeight: "bold" }}>{p.name || `관광지 ${index + 1}`}</div>
              {p.address && <div style={{ fontSize: "0.875rem", color: "#666" }}>{p.address}</div>}
            </Popup>
          </Marker>
        ))}

        {/* 추천 경로 (파란색 굵은 선) */}
        {recommendedLine.length > 0 && (
          <Polyline 
            positions={recommendedLine} 
            color="#0066cc" 
            weight={5}
            opacity={0.8}
          />
        )}

        {/* 최단 경로는 현재 사용하지 않음 */}
        {/* {shortestLine.length > 0 && (
          <Polyline
            positions={shortestLine}
            color="#666"
            weight={3}
            opacity={0.6}
            dashArray="10, 5"
          />
        )} */}
      </MapContainer>
      
      {/* 범례 */}
      <div style={{ 
        marginTop: 8, 
        display: "flex", 
        gap: 16, 
        fontSize: "0.75rem", 
        color: "#666",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, backgroundColor: "#dc3545", borderRadius: "50%" }}></div>
          <span>출발지</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 16, height: 16, backgroundColor: "#0066cc", borderRadius: "50%" }}></div>
          <span>관광지</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 30, height: 4, backgroundColor: "#0066cc" }}></div>
          <span>추천 경로</span>
        </div>
      </div>
    </div>
  );
}
