"""
지리 좌표 변환 유틸리티
WKT geometry를 위도/경도로 변환합니다.
"""
from typing import List, Tuple
from shapely import wkt
from shapely.geometry import LineString, Point
from pyproj import Transformer


class CoordinateConverter:
    """좌표 변환기 (UTM -> WGS84)"""
    
    def __init__(self):
        # UTM Zone 52N (서울 지역) -> WGS84 변환기
        self.transformer = Transformer.from_crs(
            "EPSG:5186",  # 한국 중부원점 (KATEC)
            "EPSG:4326",  # WGS84 (위도/경도)
            always_xy=True
        )

    def wkt_to_latlng(self, wkt_string: str) -> List[Tuple[float, float]]:
        """
        WKT LINESTRING을 위도/경도 좌표 리스트로 변환
        
        Args:
            wkt_string: WKT 형식의 LINESTRING
        
        Returns:
            [(lat, lng), ...] 리스트
        """
        try:
            geom = wkt.loads(wkt_string)
            if isinstance(geom, LineString):
                coords = list(geom.coords)
                # x, y -> lng, lat 변환
                transformed = [
                    (lat, lng) for lng, lat in self.transformer.itransform(coords)
                ]
                return transformed
            elif isinstance(geom, Point):
                lng, lat = self.transformer.transform(geom.x, geom.y)
                return [(lat, lng)]
        except Exception as e:
            print(f"WKT 변환 오류: {e}, WKT: {wkt_string[:100]}")
            return []
        
        return []

    def utm_to_latlng(self, x: float, y: float) -> Tuple[float, float]:
        """
        UTM 좌표를 위도/경도로 변환
        
        Args:
            x: UTM X 좌표
            y: UTM Y 좌표
        
        Returns:
            (lat, lng) 튜플
        """
        lng, lat = self.transformer.transform(x, y)
        return (lat, lng)


# 전역 변환기 인스턴스
_converter = None

def get_converter() -> CoordinateConverter:
    """전역 변환기 인스턴스 반환"""
    global _converter
    if _converter is None:
        _converter = CoordinateConverter()
    return _converter

