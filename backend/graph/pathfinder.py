"""
경로 탐색 알고리즘 (EcoPathFinder 래퍼)
"""
import logging
from typing import List, Tuple, Dict, Optional
from pathlib import Path
from graph.ecopathfinder import EcoPathFinder, PathFinderConfig

logger = logging.getLogger(__name__)


class PathFinder:
    """경로 탐색기 (EcoPathFinder 래퍼)"""

    def __init__(self, data: Path, config: Optional[PathFinderConfig] = None):
        # data를 절대 경로로 변환
        self.data = Path(data).resolve()
        logger.info(f"PathFinder 초기화: data={self.data}, exists={self.data.exists()}")
        self.finder = EcoPathFinder(config=config)
        self.season = "summer"
        self._graph_built_for_season: Dict[str, bool] = {}
        self.config = config or PathFinderConfig()

    def build_graph_for_season(self, season: str = "summer"):
        """계절에 맞게 그래프 구축"""
        if self._graph_built_for_season.get(season, False):
            return
        
        self.season = season
        
        # 링크 데이터 경로
        links_csv = self.data / "jongno_links_with_score_final_2.csv"
        shadow_csv = self.data / "shadow_score_jongno.csv"
        
        # 파일 존재 확인
        if not links_csv.exists():
            raise FileNotFoundError(
                f"링크 CSV 파일을 찾을 수 없습니다: {links_csv.absolute()}\n"
                f"데이터 디렉토리: {self.data.absolute()}\n"
                f"디렉토리 내용: {list(self.data.iterdir()) if self.data.exists() else '디렉토리 없음'}"
            )
        
        if not shadow_csv.exists():
            logger.warning(f"그림자 CSV 파일을 찾을 수 없습니다: {shadow_csv.absolute()}, 그림자 데이터 없이 진행합니다.")
            shadow_csv = None
        
        logger.info(f"그래프 구축 시작: links={links_csv}, shadow={shadow_csv}, season={season}")
        
        # 그래프 구축
        self.finder.build_graph(links_csv, shadow_csv, season)
        self._graph_built_for_season[season] = True
        logger.info(f"그래프 구축 완료: season={season}")

    def find_route(
        self,
        start_lat: float,
        start_lng: float,
        places: List[Dict],
        season: str = "summer"
    ) -> Dict:
        """
        시작점과 관광지들을 연결하는 경로 계산 (새로운 λ-sweep 알고리즘 사용)
        
        Args:
            start_lat: 시작점 위도
            start_lng: 시작점 경도
            places: 관광지 리스트 [{"lat": float, "lng": float, ...}, ...]
            season: 계절
        
        Returns:
            경로 정보 딕셔너리
        """
        # 그래프 구축 (계절별)
        self.build_graph_for_season(season)
        
        # 경로 계산 (시작 -> 관광지1 -> 관광지2 -> ...)
        all_coords = [(start_lat, start_lng)] + [(p["lat"], p["lng"]) for p in places]
        logger.info(f"경로 탐색 시작: {len(all_coords)}개 지점, season={season}")
        
        # 추천 경로 (best - detour budget 내 최고 점수)
        recommended_edges = []
        recommended_distance = 0.0
        recommended_score_sum = 0.0
        
        # 최단 경로 (baseline)
        shortest_edges = []
        shortest_distance = 0.0
        shortest_score_sum = 0.0
        
        # 각 구간별 polyline을 저장 (연결 지점 처리용)
        recommended_polylines = []
        shortest_polylines = []
        
        for i in range(len(all_coords) - 1):
            start_coord = all_coords[i]
            end_coord = all_coords[i + 1]
            
            # λ-sweep으로 경로 탐색
            try:
                result = self.finder.find_path_with_detour(
                    start_coord[0],
                    start_coord[1],
                    end_coord[0],
                    end_coord[1],
                )
            except Exception as e:
                logger.error(f"구간 {i}->{i+1} 경로 탐색 실패: {e}", exc_info=True)
                continue
            
            if result:
                # Best 경로 (추천)
                best_edges = result.best.edges
                recommended_edges.extend(best_edges)
                recommended_distance += result.best.len_m
                recommended_score_sum += result.best.avg_score * result.best.len_m
                
                # 각 구간의 polyline 생성
                segment_polyline = self.finder.path_to_polyline(best_edges)
                if segment_polyline:
                    recommended_polylines.append(segment_polyline)
                
                # Baseline 경로 (최단)
                baseline_edges = result.baseline.edges
                shortest_edges.extend(baseline_edges)
                shortest_distance += result.baseline.len_m
                shortest_score_sum += result.baseline.avg_score * result.baseline.len_m
                
                # 각 구간의 polyline 생성
                segment_polyline_shortest = self.finder.path_to_polyline(baseline_edges)
                if segment_polyline_shortest:
                    shortest_polylines.append(segment_polyline_shortest)
        
        # 여러 구간의 polyline을 하나로 연결 (중복 지점 제거)
        def merge_polylines(polylines: List[List[Tuple[float, float]]]) -> List[Tuple[float, float]]:
            """여러 polyline을 하나로 연결 (연결 지점 중복 제거)"""
            if not polylines:
                return []
            
            merged = []
            for i, polyline in enumerate(polylines):
                if not polyline:
                    continue
                
                if i == 0:
                    # 첫 번째 구간은 모든 좌표 포함
                    merged.extend(polyline)
                else:
                    # 두 번째 구간부터는 첫 좌표가 이전 마지막 좌표와 같으면 제외
                    if merged and len(polyline) > 0:
                        # 마지막 좌표와 첫 좌표 비교 (약간의 오차 허용)
                        last_point = merged[-1]
                        first_point = polyline[0]
                        
                        # 거리 계산 (위도/경도 차이로 근사, 약 10m 이내면 같은 점으로 간주)
                        # 위도 1도 ≈ 111km, 경도 1도 ≈ 111km * cos(위도)
                        lat_diff = abs(last_point[0] - first_point[0])
                        lng_diff = abs(last_point[1] - first_point[1])
                        # 서울 근처에서 대략적인 거리 (약 10m 이내)
                        dist_approx = (lat_diff * 111000) ** 2 + (lng_diff * 111000 * 0.8) ** 2
                        
                        if dist_approx < 100:  # 약 10m 이내 (더 관대한 기준)
                            # 첫 좌표 제외하고 추가
                            if len(polyline) > 1:
                                merged.extend(polyline[1:])
                            # 단일 좌표인 경우는 추가하지 않음
                        else:
                            # 연결되지 않은 경우 모두 추가
                            merged.extend(polyline)
                    else:
                        merged.extend(polyline)
            
            return merged
        
        # Polyline 변환 및 연결
        recommended_polyline = merge_polylines(recommended_polylines)
        shortest_polyline = merge_polylines(shortest_polylines)
        
        logger.info(
            f"경로 탐색 완료: "
            f"추천 경로 {len(recommended_polyline)}개 좌표, "
            f"최단 경로 {len(shortest_polyline)}개 좌표, "
            f"추천 거리 {recommended_distance:.2f}m, "
            f"최단 거리 {shortest_distance:.2f}m"
        )
        
        # Polyline이 비어있는 경우 경고
        if not recommended_polyline:
            logger.warning("추천 경로 polyline이 비어있습니다!")
        if not shortest_polyline:
            logger.warning("최단 경로 polyline이 비어있습니다!")
        
        # 평균 점수 계산 (0~100 스케일)
        avg_recommended_score = 0.0
        if recommended_distance > 0:
            avg_recommended_score = (recommended_score_sum / recommended_distance) * 100
        
        avg_shortest_score = 0.0
        if shortest_distance > 0:
            avg_shortest_score = (shortest_score_sum / shortest_distance) * 100
        
        result = {
            "recommended": {
                "distanceKm": round(recommended_distance / 1000.0, 2),
                "durationMin": int(recommended_distance / 1000.0 * 15),  # 4km/h 걷기 속도
                "score": round(avg_recommended_score, 1),
                "polyline": recommended_polyline,
                "stops": places,
            },
            "shortest": {
                "distanceKm": round(shortest_distance / 1000.0, 2),
                "durationMin": int(shortest_distance / 1000.0 * 15),
                "score": round(avg_shortest_score, 1),
                "polyline": shortest_polyline,
                "stops": places,
            }
        }
        
        logger.debug(f"반환 결과: recommended polyline 길이={len(result['recommended']['polyline'])}, "
                    f"shortest polyline 길이={len(result['shortest']['polyline'])}")
        
        return result
