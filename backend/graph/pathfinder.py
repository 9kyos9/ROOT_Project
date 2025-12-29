"""
경로 탐색 알고리즘 (EcoPathFinder 래퍼)
"""
from typing import List, Tuple, Dict, Optional
from pathlib import Path
from graph.ecopathfinder import EcoPathFinder, DETOUR_RATIO, LAMBDAS


class PathFinder:
    """경로 탐색기 (EcoPathFinder 래퍼)"""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.finder = EcoPathFinder()
        self.season = "summer"
        self._graph_built_for_season: Dict[str, bool] = {}

    def build_graph_for_season(self, season: str = "summer"):
        """계절에 맞게 그래프 구축"""
        if self._graph_built_for_season.get(season, False):
            return
        
        self.season = season
        
        # 링크 데이터 경로
        links_csv = self.data_dir / "jongno_links_with_score.csv"
        shadow_csv = self.data_dir / "shadow_score_jongno.csv"
        
        # 그래프 구축
        self.finder.build_graph(links_csv, shadow_csv, season)
        self._graph_built_for_season[season] = True

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
        
        # 추천 경로 (best - detour budget 내 최고 점수)
        recommended_edges = []
        recommended_distance = 0.0
        recommended_score_sum = 0.0
        
        # 최단 경로 (baseline)
        shortest_edges = []
        shortest_distance = 0.0
        shortest_score_sum = 0.0
        
        for i in range(len(all_coords) - 1):
            start_coord = all_coords[i]
            end_coord = all_coords[i + 1]
            
            # λ-sweep으로 경로 탐색
            result = self.finder.find_path_with_detour(
                start_coord[0],
                start_coord[1],
                end_coord[0],
                end_coord[1],
                detour_ratio=DETOUR_RATIO,
                lambdas=LAMBDAS,
            )
            
            if result:
                # Best 경로 (추천)
                best_edges = result["best"]["edges"]
                recommended_edges.extend(best_edges)
                recommended_distance += result["best"]["len_m"]
                recommended_score_sum += result["best"]["avg_score"] * result["best"]["len_m"]
                
                # Baseline 경로 (최단)
                baseline_edges = result["baseline"]["edges"]
                shortest_edges.extend(baseline_edges)
                shortest_distance += result["baseline"]["len_m"]
                shortest_score_sum += result["baseline"]["avg_score"] * result["baseline"]["len_m"]
        
        # Polyline 변환
        recommended_polyline = (
            self.finder.path_to_polyline(recommended_edges) if recommended_edges else []
        )
        shortest_polyline = (
            self.finder.path_to_polyline(shortest_edges) if shortest_edges else []
        )
        
        # 평균 점수 계산 (0~100 스케일)
        avg_recommended_score = 0.0
        if recommended_distance > 0:
            avg_recommended_score = (recommended_score_sum / recommended_distance) * 100
        
        avg_shortest_score = 0.0
        if shortest_distance > 0:
            avg_shortest_score = (shortest_score_sum / shortest_distance) * 100
        
        return {
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
