"""
환경 친화적 경로 탐색 알고리즘 (개선된 λ-sweep 알고리즘 기반)

주요 개선사항:
- R-tree 기반 빠른 nearest edge 탐색
- shapely split을 사용한 정확한 geometry 분할
- dataclass 기반 설정 및 결과 구조화
- 로깅 시스템 통합
- 안전성 및 에러 처리 개선
"""
import logging
import math
import pandas as pd
import numpy as np
import networkx as nx
from datetime import datetime
import pytz
from shapely import wkt
from shapely.geometry import Point, LineString
from shapely.ops import split
from shapely.strtree import STRtree
from pyproj import Transformer
from typing import Dict, List, Tuple, Optional, Any
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum

# 로깅 설정
logger = logging.getLogger(__name__)


# ==========================================
# 1. 설정 및 상수 정의
# ==========================================

class Season(str, Enum):
    """계절 enum"""
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"


@dataclass
class PathFinderConfig:
    """경로 탐색 설정"""
    source_epsg: int = 5186
    detour_ratio: float = 1.2
    lambdas: Tuple[float, ...] = (0, 10, 30, 60, 100, 150)
    cost_power: float = 2.0
    virtual_node_start: int = -1000001
    virtual_node_end: int = -1000002
    
    def __post_init__(self):
        """검증"""
        if self.detour_ratio < 1.0:
            raise ValueError("detour_ratio must be >= 1.0")
        if self.cost_power <= 0:
            raise ValueError("cost_power must be > 0")


@dataclass
class PathResult:
    """경로 탐색 결과"""
    path_nodes: List[int]
    edges: List[Tuple[int, int, int, Dict[str, Any]]]
    len_m: float
    avg_score: float
    lambda_value: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "path_nodes": self.path_nodes,
            "len_m": round(self.len_m, 2),
            "avg_score": round(self.avg_score, 3),
            "lambda": self.lambda_value,
        }


@dataclass
class RouteComparison:
    """경로 비교 결과"""
    baseline: PathResult
    best: PathResult
    budget_len_m: float
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "baseline": self.baseline.to_dict(),
            "best": self.best.to_dict(),
            "budget_len_m": round(self.budget_len_m, 2),
        }


# 계절별 점수 가중치
SEASON_POINTS = {
    "spring": {"flower": 9, "shade": 1, "maple": 0, "sun": 4, "wind": 1, "cool_shelter": 0, "streetfood": 0, "tour": 9},
    "summer": {"flower": 1, "shade": 9, "maple": 0, "sun": 0, "wind": 9, "cool_shelter": 9, "streetfood": 0, "tour": 9},
    "fall": {"flower": 4, "shade": 1, "maple": 9, "sun": 4, "wind": 1, "cool_shelter": 0, "streetfood": 0, "tour": 9},
    "winter": {"flower": 0, "shade": 0, "maple": 0, "sun": 9, "wind": 9, "cool_shelter": 4, "streetfood": 9, "tour": 9},
}

# 계절별 그늘 유효 시간대
SEASON_HOURS = {
    "spring": (7, 18),
    "summer": (6, 19),
    "fall": (7, 18),
    "winter": (8, 17),
}

# 점수 컬럼 매핑
COLMAP = {
    "flower": "flower_score",
    "maple": "maple_score",
    "cool_shelter": "shelter_score",
    "streetfood": "streetfood_score",
    "tour": "tour_score",
    "shade": "shade_score",
    "wind": "wind_score",
}


# ==========================================
# 2. 유틸리티 함수
# ==========================================

def _clamp01(x: float) -> float:
    """값을 0~1 범위로 제한"""
    if x < 0:
        return 0.0
    if x > 1:
        return 1.0
    return float(x)


def season_weights(season: str) -> Dict[str, float]:
    """계절별 가중치 정규화 (합이 1이 되도록)"""
    pts = SEASON_POINTS.get(season, SEASON_POINTS["summer"])
    total = sum(pts.values())
    if total == 0:
        return {}
    return {k: v / total for k, v in pts.items() if v > 0}


def pick_shadow_column(now: datetime, season: str) -> Optional[str]:
    """
    현재 시간대에 맞는 그림자 컬럼명 선택
    
    Args:
        now: 현재 시각 (KST)
        season: 계절
    
    Returns:
        그림자 컬럼명 (예: "1215_13_me") 또는 None (그늘 미사용 시간대)
    """
    mm = now.strftime("%m")
    dd = "01" if now.day <= 14 else "15"  # 1~14일 / 15~말일 대표값
    hh = int(now.strftime("%H"))
    
    min_h, max_h = SEASON_HOURS.get(season, (6, 19))
    if not (min_h <= hh <= max_h):
        return None  # 해 없는 시간대 -> 그늘 미사용
    
    return f"{mm}{dd}_{hh:02d}_me"


def get_current_season_and_shadow_col() -> Tuple[datetime, str, Optional[str]]:
    """현재 시점의 계절과 그림자 컬럼명 반환"""
    KST = pytz.timezone("Asia/Seoul")
    now = datetime.now(KST)
    
    m = now.month
    if m in (3, 4, 5):
        season = "spring"
    elif m in (6, 7, 8):
        season = "summer"
    elif m in (9, 10, 11):
        season = "fall"
    else:
        season = "winter"
    
    shadow_col = pick_shadow_column(now, season)
    logger.info(f"Current season: {season}, shadow_col: {shadow_col}")
    return now, season, shadow_col


def prepare_shadow_dict(csv_path: Path, shadow_col: Optional[str]) -> Dict[int, float]:
    """그림자 데이터 딕셔너리 생성"""
    try:
        shadow_df = pd.read_csv(csv_path, encoding="utf-8-sig")
        
        # LINK만 필터링
        if "노드링크 유형" in shadow_df.columns:
            shadow_df = shadow_df[
                shadow_df["노드링크 유형"].astype(str).str.upper() == "LINK"
            ].copy()
        
        # 링크 ID 컬럼 찾기
        link_id_col = None
        for c in ["링크 ID", "link_id", "LINK_ID", "linkId"]:
            if c in shadow_df.columns:
                link_id_col = c
                break
        
        if link_id_col is None:
            logger.warning(f"링크 ID 컬럼을 찾을 수 없습니다: {csv_path}")
            return {}
        
        # 그림자 점수 계산
        if shadow_col is None or shadow_col not in shadow_df.columns:
            shadow_df["shadow_score"] = 0.0
            logger.info("그림자 컬럼이 없어 모든 값을 0으로 설정")
        else:
            shadow_df["shadow_score"] = shadow_df[shadow_col].fillna(0.0)
        
        # 링크별 평균 그림자 점수
        shadow_by_link = (
            shadow_df[[link_id_col, "shadow_score"]]
            .groupby(link_id_col, as_index=False)["shadow_score"].mean()
        )
        
        shadow_dict = dict(zip(shadow_by_link[link_id_col], shadow_by_link["shadow_score"]))
        result = {int(k): float(v) for k, v in shadow_dict.items()}
        logger.info(f"그림자 딕셔너리 생성 완료: {len(result)}개 링크")
        return result
    except Exception as e:
        logger.error(f"그림자 데이터 로딩 오류: {e}", exc_info=True)
        return {}


# ==========================================
# 3. 그래프 구축
# ==========================================

def build_graph_from_csv(
    csv_path: Path,
    season: str,
    shadow_dict: Optional[Dict[int, float]] = None
) -> nx.MultiGraph:
    """
    CSV에서 그래프 구축
    
    각 edge는 다음 속성을 가짐:
    - length (meters)
    - total_score (0~1)
    - geometry_wkt
    - link_id
    - comp_* (개별 점수, 디버깅용)
    """
    logger.info(f"그래프 구축 시작: {csv_path}, season={season}")
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    w = season_weights(season)
    
    G = nx.MultiGraph()
    
    # 사용 가능한 점수 컬럼 확인
    usable = [k for k in w if COLMAP.get(k) in df.columns]
    
    # shade가 사용되면 sun도 추가
    if "shade" in usable:
        usable.append("sun")
    
    # 가중치 정규화
    wsum = sum(w[k] for k in usable if k in w) if usable else 1.0
    w_norm = {k: w[k] / wsum for k in usable if k in w}
    
    logger.info(f"사용 가능한 점수 요소: {usable}, 정규화 가중치: {w_norm}")
    
    edge_count = 0
    for _, r in df.iterrows():
        try:
            u = int(r["시작노드 ID"])
            v = int(r["종료노드 ID"])
            link_id = int(r["링크 ID"])
            length = float(r["link_len_m"])
            geom_wkt = r.get("geometry_wkt", "")
            
            if not geom_wkt:
                continue
            
            # 개별 점수 계산
            comp = {}
            for k in usable:
                if k == "shade":
                    # shadow_dict에서 가져오거나 CSV에서 가져오기
                    if shadow_dict is not None:
                        raw = float(shadow_dict.get(link_id, 0.0))
                    else:
                        col_name = COLMAP.get("shade")
                        raw = float(r[col_name]) if col_name in df.columns else 0.0
                    
                    raw = _clamp01(raw)
                    # ✅ 내부 의미 통일: 1에 가까울수록 "그늘 많음"
                    comp[k] = 1.0 - raw
                    
                elif k == "sun":
                    # sun은 "그늘 없음(햇빛 많음)" 점수
                    comp[k] = 1.0 - float(comp.get("shade", 0.0))
                    
                else:
                    col_name = COLMAP.get(k)
                    comp[k] = _clamp01(float(r[col_name]) if col_name in df.columns else 0.0)
            
            # 종합 환경 점수
            total_score = sum(w_norm.get(k, 0.0) * comp[k] for k in comp) if comp else 0.0
            total_score = _clamp01(float(total_score))
            
            # Edge 속성
            attr = {
                "link_id": link_id,
                "length": length,
                "total_score": total_score,
                "geometry_wkt": geom_wkt,
                **{f"comp_{k}": comp[k] for k in comp}
            }
            
            G.add_edge(u, v, key=link_id, **attr)
            edge_count += 1
        except Exception as e:
            logger.warning(f"Edge 추가 실패 (link_id={r.get('링크 ID', 'unknown')}): {e}")
            continue
    
    logger.info(f"그래프 구축 완료: {edge_count}개 edge, {G.number_of_nodes()}개 노드")
    return G


# ==========================================
# 4. R-tree 기반 빠른 스냅 (성능 개선)
# ==========================================

class EdgeSpatialIndex:
    """R-tree 기반 edge 공간 인덱스"""
    
    def __init__(self, G: nx.MultiGraph, source_epsg: int):
        self.G = G
        self.source_epsg = source_epsg
        self.tf = Transformer.from_crs("EPSG:4326", f"EPSG:{source_epsg}", always_xy=True)
        self._build_index()
    
    def _build_index(self):
        """R-tree 인덱스 구축"""
        self.edges_data = []
        self.geometries = []
        
        for u, v, k, data in self.G.edges(keys=True, data=True):
            geom_wkt = data.get("geometry_wkt", "")
            if not geom_wkt:
                continue
            
            try:
                geom = wkt.loads(geom_wkt)
                self.edges_data.append((u, v, k, data))
                self.geometries.append(geom)
            except Exception as e:
                logger.warning(f"Geometry 로딩 실패 (u={u}, v={v}, k={k}): {e}")
                continue
        
        if self.geometries:
            self.tree = STRtree(self.geometries)
        else:
            self.tree = None
            logger.warning("빈 R-tree 생성")
    
    def find_nearest_edge(self, lat: float, lon: float) -> Dict[str, Any]:
        """가장 가까운 edge 찾기"""
        x, y = self.tf.transform(lon, lat)
        user_pt = Point(x, y)
        
        if self.tree is None or len(self.geometries) == 0:
            raise ValueError("R-tree가 비어있습니다")
        
        # R-tree로 후보 찾기
        candidates = self.tree.query(user_pt.buffer(1000))  # 1km 버퍼 (충분히 큰 값)
        
        best = {"dist": float("inf")}
        
        for idx in candidates:
            geom = self.geometries[idx]
            u, v, k, data = self.edges_data[idx]
            
            try:
                # 가장 가까운 점 찾기
                p = geom.interpolate(geom.project(user_pt))
                d = user_pt.distance(p)
                
                if d < best["dist"]:
                    best = {
                        "u": u,
                        "v": v,
                        "key": k,
                        "snap_point": p,
                        "dist": d,
                        "attr": data,
                        "geometry": geom,
                    }
            except Exception as e:
                logger.debug(f"Edge 거리 계산 실패 (u={u}, v={v}, k={k}): {e}")
                continue
        
        if best["dist"] == float("inf"):
            raise ValueError("가장 가까운 edge를 찾을 수 없습니다")
        
        return best


def snap_point_to_nearest_edge(
    lat: float, lon: float, G: nx.MultiGraph, source_epsg: int
) -> Dict[str, Any]:
    """가장 가까운 edge에 점을 snap (R-tree 사용)"""
    index = EdgeSpatialIndex(G, source_epsg)
    return index.find_nearest_edge(lat, lon)


# ==========================================
# 5. 정확한 geometry 분할 (shapely split 사용)
# ==========================================

def split_edge_by_key(
    G: nx.MultiGraph,
    u: int,
    v: int,
    key: int,
    snap_point: Point,
    virtual_node: int
) -> None:
    """
    Edge를 snap_point에서 정확히 분할하여 가상 노드 삽입
    
    shapely.ops.split을 사용하여 정확한 분할 수행
    (u, v, key)를 (u -> virtual_node), (virtual_node -> v)로 분할
    """
    if not G.has_edge(u, v, key):
        logger.warning(f"Edge가 존재하지 않습니다: ({u}, {v}, {key})")
        return
    
    attr = G.edges[u, v, key]
    geom_wkt = attr.get("geometry_wkt", "")
    
    if not geom_wkt:
        logger.warning(f"Geometry가 없습니다: ({u}, {v}, {key})")
        return
    
    try:
        geom = wkt.loads(geom_wkt)
        
        # snap_point를 LineString에 투영하여 정확한 분할점 찾기
        projected_point = geom.interpolate(geom.project(snap_point))
        
        # shapely.ops.split을 사용하여 정확히 분할
        # split은 MultiLineString을 반환하므로, 각 부분을 LineString으로 변환
        split_result = split(geom, projected_point)
        
        if len(split_result.geoms) < 2:
            # 분할 실패 (예: 끝점에 너무 가까움)
            logger.warning(f"Geometry 분할 실패: 너무 끝점에 가까움")
            return
        
        g1 = LineString(split_result.geoms[0].coords)
        g2 = LineString(split_result.geoms[1].coords)
        
        # 길이 계산
        l1, l2 = g1.length, g2.length
        total_len = l1 + l2
        
        if total_len <= 0:
            logger.warning(f"분할된 geometry 길이가 0입니다")
            return
        
        # 비율 계산
        r1 = l1 / total_len
        r2 = l2 / total_len
        
        # 원본 edge 제거
        G.remove_edge(u, v, key)
        
        # 길이 비례 분할
        original_length = float(attr.get("length", 0.0))
        len1 = original_length * r1
        len2 = original_length * r2
        
        # 점수/컴포넌트 유지
        keep = {}
        keep["total_score"] = float(attr.get("total_score", 0.0))
        keep["link_id"] = attr.get("link_id", key)
        for kk, vv in attr.items():
            if str(kk).startswith("comp_"):
                keep[kk] = vv
        
        # 새 edge 추가
        G.add_edge(u, virtual_node, length=len1, geometry_wkt=g1.wkt, **keep)
        G.add_edge(virtual_node, v, length=len2, geometry_wkt=g2.wkt, **keep)
        
        logger.debug(f"Edge 분할 완료: ({u}, {v}, {key}) -> ({u}, {virtual_node}), ({virtual_node}, {v})")
        
    except Exception as e:
        logger.error(f"Edge 분할 오류: ({u}, {v}, {key}): {e}", exc_info=True)


# ==========================================
# 6. 경로 추출 및 통계
# ==========================================

def extract_edges_for_path(
    G: nx.MultiGraph, path_nodes: List[int], weight_attr: str
) -> List[Tuple[int, int, int, Dict[str, Any]]]:
    """경로 노드 리스트에서 edge 데이터 추출 (안전성 개선)"""
    edges = []
    for a, b in zip(path_nodes[:-1], path_nodes[1:]):
        data = G.get_edge_data(a, b)  # {key: attr}
        if not data:
            logger.warning(f"Edge 데이터 없음: ({a}, {b})")
            continue
        
        # 최소 weight를 가진 edge 선택 (안전성 개선)
        best_key = None
        best_weight = float("inf")
        
        for k, attr in data.items():
            weight = attr.get(weight_attr)
            if weight is None:
                continue
            try:
                weight_val = float(weight)
                if weight_val < best_weight:
                    best_weight = weight_val
                    best_key = k
            except (ValueError, TypeError):
                continue
        
        if best_key is None:
            logger.warning(f"유효한 weight를 가진 edge 없음: ({a}, {b})")
            continue
        
        edges.append((a, b, best_key, data[best_key]))
    
    return edges


def route_stats(
    edges: List[Tuple], length_attr: str = "length", score_attr: str = "total_score"
) -> Tuple[float, float]:
    """경로 통계 계산 (총 길이, 평균 점수)"""
    total_len = 0.0
    score_len_sum = 0.0
    
    for _, _, _, attr in edges:
        try:
            L = float(attr.get(length_attr, 0.0))
            s = _clamp01(float(attr.get(score_attr, 0.0)))
            total_len += L
            score_len_sum += s * L
        except (ValueError, TypeError) as e:
            logger.debug(f"통계 계산 중 오류: {e}")
            continue
    
    avg_score = (score_len_sum / total_len) if total_len > 0 else 0.0
    return total_len, avg_score


# ==========================================
# 7. λ-sweep 경로 탐색
# ==========================================

def lambda_sweep_best_path(
    G: nx.MultiGraph,
    source: int,
    target: int,
    config: PathFinderConfig,
    length_attr: str = "length",
    score_attr: str = "total_score",
    cost_attr: str = "cost_lam",
    L_ref: Optional[float] = None,
) -> RouteComparison:
    """
    λ-sweep 알고리즘으로 detour budget 내 최고 점수 경로 탐색
    
    Args:
        G: MultiGraph
        source: 시작 노드
        target: 목표 노드
        config: 설정
        length_attr: 길이 속성명
        score_attr: 점수 속성명
        cost_attr: 임시 cost 속성명
        L_ref: 길이 정규화 기준값 (None이면 median 자동 계산)
    
    Returns:
        RouteComparison 객체
    """
    # L_ref 자동 계산 (median)
    if L_ref is None:
        lens = [
            float(d.get(length_attr, 0.0))
            for _, _, _, d in G.edges(keys=True, data=True)
            if float(d.get(length_attr, 0.0)) > 0
        ]
        if not lens:
            raise ValueError(f"No positive '{length_attr}' found on edges.")
        L_ref = float(np.median(lens))
        logger.info(f"L_ref (median length): {L_ref:.2f}m")
    
    # Baseline: 최단 경로 (length만 사용)
    try:
        base_nodes = nx.dijkstra_path(G, source, target, weight=length_attr)
    except nx.NetworkXNoPath:
        raise ValueError(f"No path found from {source} to {target}")
    
    base_edges = extract_edges_for_path(G, base_nodes, weight_attr=length_attr)
    L0, S0 = route_stats(base_edges, length_attr=length_attr, score_attr=score_attr)
    
    L_budget = L0 * config.detour_ratio
    
    logger.info(f"Baseline: 길이={L0:.2f}m, 점수={S0:.3f}, Budget={L_budget:.2f}m")
    
    best = PathResult(
        path_nodes=base_nodes,
        edges=base_edges,
        len_m=L0,
        avg_score=S0,
        lambda_value=0,
    )
    
    # Lambda sweep
    for lam in config.lambdas:
        # 임시 cost 계산: cost = (length / L_ref) + λ * (1 - score)^p
        for _, _, _, data in G.edges(keys=True, data=True):
            L = float(data.get(length_attr, 0.0))
            s = _clamp01(float(data.get(score_attr, 0.0)))
            
            L_norm = L / L_ref
            data[cost_attr] = L_norm + lam * ((1.0 - s) ** config.cost_power)
        
        try:
            nodes = nx.dijkstra_path(G, source, target, weight=cost_attr)
        except nx.NetworkXNoPath:
            continue
        
        edges = extract_edges_for_path(G, nodes, weight_attr=cost_attr)
        L, S = route_stats(edges, length_attr=length_attr, score_attr=score_attr)
        
        # Detour budget 내에서 최고 점수 선택
        if L <= L_budget:
            if (S > best.avg_score) or (
                abs(S - best.avg_score) < 1e-12 and L < best.len_m
            ):
                best = PathResult(
                    path_nodes=nodes,
                    edges=edges,
                    len_m=L,
                    avg_score=S,
                    lambda_value=lam,
                )
                logger.debug(f"Lambda={lam}: 길이={L:.2f}m, 점수={S:.3f}")
    
    baseline = PathResult(
        path_nodes=base_nodes,
        edges=base_edges,
        len_m=L0,
        avg_score=S0,
        lambda_value=None,
    )
    
    logger.info(f"Best: lambda={best.lambda_value}, 길이={best.len_m:.2f}m, 점수={best.avg_score:.3f}")
    
    return RouteComparison(
        baseline=baseline,
        best=best,
        budget_len_m=L_budget,
    )


# ==========================================
# 8. 시각화 유틸리티
# ==========================================

def edges_to_latlon_lines(
    edges: List[Tuple], source_epsg: int
) -> List[List[Tuple[float, float]]]:
    """Edge 리스트를 위도/경도 polyline 리스트로 변환"""
    tf = Transformer.from_crs(f"EPSG:{source_epsg}", "EPSG:4326", always_xy=True)
    lines = []
    
    for _, _, _, attr in edges:
        geom_wkt = attr.get("geometry_wkt", "")
        if not geom_wkt:
            continue
        
        try:
            geom = wkt.loads(geom_wkt)
            coords = []
            for x, y in geom.coords:
                lon, lat = tf.transform(x, y)
                coords.append((lat, lon))
            if len(coords) >= 2:
                lines.append(coords)
        except Exception as e:
            logger.debug(f"좌표 변환 오류: {e}")
            continue
    
    return lines


# ==========================================
# 9. 메인 클래스
# ==========================================

class EcoPathFinder:
    """환경 친화적 경로 탐색기 (개선된 λ-sweep 알고리즘)"""
    
    def __init__(self, config: Optional[PathFinderConfig] = None):
        """
        초기화
        
        Args:
            config: 설정 객체 (None이면 기본값 사용)
        """
        self.config = config or PathFinderConfig()
        self.tf_to_wgs = Transformer.from_crs(
            f"EPSG:{self.config.source_epsg}", "EPSG:4326", always_xy=True
        )
        self.tf_to_epsg = Transformer.from_crs(
            "EPSG:4326", f"EPSG:{self.config.source_epsg}", always_xy=True
        )
        self.G: Optional[nx.MultiGraph] = None
        self.shadow_dict: Dict[int, float] = {}
        self._spatial_index: Optional[EdgeSpatialIndex] = None
    
    def build_graph(
        self,
        csv_path: Path,
        shadow_csv_path: Optional[Path] = None,
        season: Optional[str] = None,
    ):
        """
        그래프 구축
        
        Args:
            csv_path: 링크 점수 CSV 경로
            shadow_csv_path: 그림자 점수 CSV 경로 (선택)
            season: 계절 (None이면 자동 선택)
        """
        # 계절 자동 선택
        if season is None:
            _, season, shadow_col = get_current_season_and_shadow_col()
        else:
            _, _, shadow_col = get_current_season_and_shadow_col()
        
        # 그림자 데이터 준비
        if shadow_csv_path:
            self.shadow_dict = prepare_shadow_dict(shadow_csv_path, shadow_col)
        else:
            self.shadow_dict = {}
        
        # 그래프 구축
        self.G = build_graph_from_csv(csv_path, season, shadow_dict=self.shadow_dict)
        
        # 공간 인덱스 구축 (스냅 성능 향상)
        if self.G:
            self._spatial_index = EdgeSpatialIndex(self.G, self.config.source_epsg)
    
    def find_path_with_detour(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        detour_ratio: Optional[float] = None,
        lambdas: Optional[Tuple[float, ...]] = None,
    ) -> Optional[RouteComparison]:
        """
        시작점과 끝점 사이의 경로 탐색 (baseline + best)
        
        Args:
            start_lat: 시작점 위도
            start_lon: 시작점 경도
            end_lat: 끝점 위도
            end_lon: 끝점 경도
            detour_ratio: 우회 비율 (None이면 config 사용)
            lambdas: lambda 값들 (None이면 config 사용)
        
        Returns:
            RouteComparison 객체 또는 None (오류 시)
        """
        if self.G is None:
            raise ValueError("Graph not built. Call build_graph() first.")
        
        # 설정 오버라이드
        config = self.config
        if detour_ratio is not None or lambdas is not None:
            config = PathFinderConfig(
                source_epsg=self.config.source_epsg,
                detour_ratio=detour_ratio or self.config.detour_ratio,
                lambdas=lambdas or self.config.lambdas,
                cost_power=self.config.cost_power,
                virtual_node_start=self.config.virtual_node_start,
                virtual_node_end=self.config.virtual_node_end,
            )
        
        # 가상 노드 설정
        start_virtual = config.virtual_node_start
        end_virtual = config.virtual_node_end
        
        try:
            # Snap & split
            snap_s = snap_point_to_nearest_edge(
                start_lat, start_lon, self.G, self.config.source_epsg
            )
            split_edge_by_key(
                self.G,
                snap_s["u"],
                snap_s["v"],
                snap_s["key"],
                snap_s["snap_point"],
                start_virtual,
            )
            
            # 끝점 스냅 (업데이트된 그래프에서)
            snap_e = snap_point_to_nearest_edge(
                end_lat, end_lon, self.G, self.config.source_epsg
            )
            split_edge_by_key(
                self.G,
                snap_e["u"],
                snap_e["v"],
                snap_e["key"],
                snap_e["snap_point"],
                end_virtual,
            )
            
            # λ-sweep 실행
            res = lambda_sweep_best_path(
                self.G,
                start_virtual,
                end_virtual,
                config=config,
            )
            
            return res
            
        except Exception as e:
            logger.error(f"경로 탐색 오류: {e}", exc_info=True)
            return None
        finally:
            # 가상 노드 제거
            if self.G.has_node(start_virtual):
                self.G.remove_node(start_virtual)
            if self.G.has_node(end_virtual):
                self.G.remove_node(end_virtual)
    
    def path_to_polyline(self, edges: List[Tuple]) -> List[Tuple[float, float]]:
        """Edge 리스트를 하나의 연속된 polyline으로 변환"""
        if not edges:
            return []
        
        polyline = []
        
        for i, (_, _, _, attr) in enumerate(edges):
            geom_wkt = attr.get("geometry_wkt", "")
            if not geom_wkt:
                continue
            
            try:
                geom = wkt.loads(geom_wkt)
                coords = []
                for x, y in geom.coords:
                    lon, lat = self.tf_to_wgs.transform(x, y)
                    coords.append((lat, lon))
                
                if not coords:
                    continue
                
                # 첫 번째 edge는 모든 좌표 포함
                if i == 0:
                    polyline.extend(coords)
                else:
                    # 두 번째 edge부터는 첫 번째 좌표를 제외하고 추가
                    if len(coords) > 1:
                        polyline.extend(coords[1:])
                    elif len(coords) == 1:
                        # 단일 좌표인 경우, 이전 좌표와 다르면 추가
                        if not polyline or coords[0] != polyline[-1]:
                            polyline.append(coords[0])
            except Exception as e:
                logger.debug(f"좌표 변환 오류: {e}")
                continue
        
        return polyline
