"""
EcoPathFinder 테스트 코드
"""
import pytest
import networkx as nx
from shapely.geometry import Point, LineString
from shapely import wkt
from graph.ecopathfinder import (
    _clamp01,
    season_weights,
    pick_shadow_column,
    split_edge_by_key,
    extract_edges_for_path,
    route_stats,
    PathFinderConfig,
    PathResult,
    RouteComparison,
)
from datetime import datetime
import pytz


class TestUtilities:
    """유틸리티 함수 테스트"""
    
    def test_clamp01(self):
        """값 클램핑 테스트"""
        assert _clamp01(0.5) == 0.5
        assert _clamp01(-1.0) == 0.0
        assert _clamp01(1.5) == 1.0
        assert _clamp01(0.0) == 0.0
        assert _clamp01(1.0) == 1.0
    
    def test_season_weights(self):
        """계절별 가중치 테스트"""
        w = season_weights("summer")
        assert isinstance(w, dict)
        assert sum(w.values()) == pytest.approx(1.0, abs=1e-6)
        assert "shade" in w
        assert w["shade"] > 0
    
    def test_pick_shadow_column(self):
        """그림자 컬럼 선택 테스트"""
        KST = pytz.timezone("Asia/Seoul")
        now = datetime(2024, 7, 15, 14, 0, 0, tzinfo=KST)
        
        # 여름 14시 -> 그림자 컬럼 있음
        col = pick_shadow_column(now, "summer")
        assert col is not None
        assert col.startswith("07")
        
        # 여름 22시 -> 그림자 컬럼 없음
        now_night = datetime(2024, 7, 15, 22, 0, 0, tzinfo=KST)
        col_night = pick_shadow_column(now_night, "summer")
        assert col_night is None


class TestPathFinderConfig:
    """설정 테스트"""
    
    def test_default_config(self):
        """기본 설정 테스트"""
        config = PathFinderConfig()
        assert config.source_epsg == 5186
        assert config.detour_ratio == 1.2
        assert len(config.lambdas) > 0
    
    def test_config_validation(self):
        """설정 검증 테스트"""
        # detour_ratio < 1.0 -> 오류
        with pytest.raises(ValueError):
            PathFinderConfig(detour_ratio=0.5)
        
        # cost_power <= 0 -> 오류
        with pytest.raises(ValueError):
            PathFinderConfig(cost_power=0)


class TestEdgeSplitting:
    """Edge 분할 테스트"""
    
    def test_split_edge_simple(self):
        """간단한 edge 분할 테스트"""
        G = nx.MultiGraph()
        
        # 간단한 LineString 생성
        line = LineString([(0, 0), (10, 0), (20, 0)])
        G.add_edge(1, 2, key=100, length=20.0, total_score=0.5, geometry_wkt=line.wkt)
        
        # 중간점에서 분할
        snap_point = Point(10, 0)
        split_edge_by_key(G, 1, 2, 100, snap_point, -1000)
        
        # 분할 확인
        assert G.has_edge(1, -1000)
        assert G.has_edge(-1000, 2)
        assert not G.has_edge(1, 2, key=100)
        
        # 길이 확인 (대략적으로)
        edge1 = G.edges[1, -1000, 0]
        edge2 = G.edges[-1000, 2, 0]
        total_len = edge1["length"] + edge2["length"]
        assert abs(total_len - 20.0) < 1.0  # 약간의 오차 허용
    
    def test_split_edge_preserves_score(self):
        """분할 시 점수 보존 테스트"""
        G = nx.MultiGraph()
        
        line = LineString([(0, 0), (10, 0)])
        G.add_edge(
            1, 2, key=100,
            length=10.0,
            total_score=0.8,
            comp_flower=0.5,
            geometry_wkt=line.wkt
        )
        
        snap_point = Point(5, 0)
        split_edge_by_key(G, 1, 2, 100, snap_point, -1000)
        
        # 점수 보존 확인
        edge1 = G.edges[1, -1000, 0]
        edge2 = G.edges[-1000, 2, 0]
        
        assert edge1["total_score"] == 0.8
        assert edge2["total_score"] == 0.8
        assert edge1["comp_flower"] == 0.5
        assert edge2["comp_flower"] == 0.5


class TestPathExtraction:
    """경로 추출 테스트"""
    
    def test_extract_edges_for_path(self):
        """경로에서 edge 추출 테스트"""
        G = nx.MultiGraph()
        
        # 간단한 경로 생성
        line1 = LineString([(0, 0), (10, 0)])
        line2 = LineString([(10, 0), (20, 0)])
        
        G.add_edge(1, 2, key=100, length=10.0, total_score=0.5, geometry_wkt=line1.wkt)
        G.add_edge(2, 3, key=200, length=10.0, total_score=0.7, geometry_wkt=line2.wkt)
        
        path = [1, 2, 3]
        edges = extract_edges_for_path(G, path, weight_attr="length")
        
        assert len(edges) == 2
        assert edges[0][0] == 1 and edges[0][1] == 2
        assert edges[1][0] == 2 and edges[1][1] == 3
    
    def test_extract_edges_multigraph(self):
        """MultiGraph에서 최소 weight edge 선택 테스트"""
        G = nx.MultiGraph()
        
        line = LineString([(0, 0), (10, 0)])
        
        # 같은 노드 쌍에 여러 edge 추가
        G.add_edge(1, 2, key=100, length=10.0, total_score=0.5, geometry_wkt=line.wkt)
        G.add_edge(1, 2, key=101, length=5.0, total_score=0.6, geometry_wkt=line.wkt)  # 더 짧음
        
        path = [1, 2]
        edges = extract_edges_for_path(G, path, weight_attr="length")
        
        assert len(edges) == 1
        assert edges[0][2] == 101  # 더 짧은 edge 선택


class TestRouteStats:
    """경로 통계 테스트"""
    
    def test_route_stats_simple(self):
        """간단한 통계 계산 테스트"""
        edges = [
            (1, 2, 100, {"length": 10.0, "total_score": 0.5}),
            (2, 3, 200, {"length": 20.0, "total_score": 0.8}),
        ]
        
        total_len, avg_score = route_stats(edges)
        
        assert total_len == 30.0
        # 가중 평균: (0.5*10 + 0.8*20) / 30 = 21/30 = 0.7
        assert avg_score == pytest.approx(0.7, abs=1e-6)
    
    def test_route_stats_empty(self):
        """빈 경로 통계 테스트"""
        edges = []
        total_len, avg_score = route_stats(edges)
        
        assert total_len == 0.0
        assert avg_score == 0.0
    
    def test_route_stats_clamp(self):
        """점수 클램핑 테스트"""
        edges = [
            (1, 2, 100, {"length": 10.0, "total_score": 1.5}),  # 1.5 -> 1.0으로 클램핑
            (2, 3, 200, {"length": 10.0, "total_score": -0.5}),  # -0.5 -> 0.0으로 클램핑
        ]
        
        total_len, avg_score = route_stats(edges)
        
        assert total_len == 20.0
        # 가중 평균: (1.0*10 + 0.0*10) / 20 = 0.5
        assert avg_score == pytest.approx(0.5, abs=1e-6)


class TestPathResult:
    """경로 결과 테스트"""
    
    def test_path_result_to_dict(self):
        """PathResult 딕셔너리 변환 테스트"""
        edges = [(1, 2, 100, {"length": 10.0, "total_score": 0.5})]
        result = PathResult(
            path_nodes=[1, 2],
            edges=edges,
            len_m=10.0,
            avg_score=0.5,
            lambda_value=10,
        )
        
        d = result.to_dict()
        assert d["len_m"] == 10.0
        assert d["avg_score"] == 0.5
        assert d["lambda"] == 10
        assert d["path_nodes"] == [1, 2]


class TestIntegration:
    """통합 테스트"""
    
    def test_simple_path_finding(self):
        """간단한 경로 탐색 통합 테스트"""
        from graph.ecopathfinder import build_graph_from_csv, lambda_sweep_best_path, PathFinderConfig
        import tempfile
        import pandas as pd
        
        # 테스트용 CSV 생성
        test_data = {
            "시작노드 ID": [1, 2, 3],
            "종료노드 ID": [2, 3, 4],
            "링크 ID": [100, 200, 300],
            "link_len_m": [10.0, 20.0, 15.0],
            "geometry_wkt": [
                LineString([(0, 0), (10, 0)]).wkt,
                LineString([(10, 0), (30, 0)]).wkt,
                LineString([(30, 0), (45, 0)]).wkt,
            ],
            "flower_score": [0.5, 0.7, 0.6],
            "tour_score": [0.8, 0.9, 0.7],
        }
        
        df = pd.DataFrame(test_data)
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            df.to_csv(f.name, index=False, encoding='utf-8-sig')
            csv_path = f.name
        
        try:
            # 그래프 구축
            G = build_graph_from_csv(csv_path, "summer", shadow_dict=None)
            
            assert G.number_of_nodes() >= 2
            assert G.number_of_edges() == 3
            
            # 경로 탐색
            config = PathFinderConfig(detour_ratio=1.5, lambdas=(0, 10))
            result = lambda_sweep_best_path(G, 1, 4, config)
            
            assert result.baseline.len_m > 0
            assert result.best.len_m > 0
            assert result.best.len_m <= result.budget_len_m
            
        finally:
            import os
            os.unlink(csv_path)

