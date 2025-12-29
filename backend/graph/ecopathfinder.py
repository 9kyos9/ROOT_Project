"""
환경 친화적 경로 탐색 알고리즘 (새로운 λ-sweep 알고리즘 기반)
"""
import pandas as pd
import numpy as np
import networkx as nx
import math
from datetime import datetime
import pytz
from shapely import wkt
from shapely.geometry import Point, LineString
from pyproj import Transformer
from typing import Dict, List, Tuple, Optional
from pathlib import Path


# ==========================================
# 1. 설정 및 상수 정의
# ==========================================
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

COLMAP = {
    "flower": "flower_score",
    "maple": "maple_score",
    "cool_shelter": "shelter_score",
    "streetfood": "streetfood_score",
    "tour": "tour_score",
    "shade": "shade_score",
    "wind": "wind_score"
}

# 기본 설정값
DETOUR_RATIO = 1.2
LAMBDAS = (0, 10, 30, 60, 100, 150)
SOURCE_EPSG = 5186


def _clamp01(x: float) -> float:
    """값을 0~1 범위로 제한"""
    if x < 0:
        return 0.0
    if x > 1:
        return 1.0
    return x


def season_weights(season: str) -> dict:
    """계절별 가중치 정규화 (합이 1이 되도록)"""
    pts = SEASON_POINTS.get(season, SEASON_POINTS["summer"])
    total = sum(pts.values())
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


def get_current_season_and_shadow_col():
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
            return {}
        
        # 그림자 점수 계산
        if shadow_col is None or shadow_col not in shadow_df.columns:
            shadow_df["shadow_score"] = 0.0
        else:
            shadow_df["shadow_score"] = shadow_df[shadow_col].fillna(0.0)
        
        # 링크별 평균 그림자 점수
        shadow_by_link = (
            shadow_df[[link_id_col, "shadow_score"]]
            .groupby(link_id_col, as_index=False)["shadow_score"].mean()
        )
        
        shadow_dict = dict(zip(shadow_by_link[link_id_col], shadow_by_link["shadow_score"]))
        return {int(k): float(v) for k, v in shadow_dict.items()}
    except Exception as e:
        print(f"그림자 데이터 로딩 오류: {e}")
        return {}


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
    
    for _, r in df.iterrows():
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
                if shadow_dict is not None:
                    comp[k] = float(shadow_dict.get(link_id, 0.0))
                else:
                    col_name = COLMAP.get("shade")
                    comp[k] = float(r[col_name]) if col_name in df.columns else 0.0
            elif k == "sun":
                comp[k] = 1.0 - float(comp.get("shade", 0.0))
            else:
                col_name = COLMAP.get(k)
                comp[k] = float(r[col_name]) if col_name in df.columns else 0.0
            
            comp[k] = _clamp01(comp[k])
        
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
    
    return G


def snap_point_to_nearest_edge(
    lat: float, lon: float, G: nx.MultiGraph, source_epsg: int
) -> Dict:
    """가장 가까운 edge에 점을 snap"""
    tf = Transformer.from_crs("EPSG:4326", f"EPSG:{source_epsg}", always_xy=True)
    x, y = tf.transform(lon, lat)
    user_pt = Point(x, y)
    
    best = {"dist": float("inf")}
    for u, v, k, data in G.edges(keys=True, data=True):
        geom_wkt = data.get("geometry_wkt", "")
        if not geom_wkt:
            continue
        
        try:
            geom = wkt.loads(geom_wkt)
            p = geom.interpolate(geom.project(user_pt))
            d = user_pt.distance(p)
            if d < best["dist"]:
                best = {
                    "u": u,
                    "v": v,
                    "key": k,
                    "snap_point": p,
                    "dist": d,
                    "attr": data
                }
        except:
            continue
    
    return best


def split_edge_by_key(
    G: nx.MultiGraph,
    u: int,
    v: int,
    key: int,
    snap_point: Point,
    virtual_node: int
) -> None:
    """
    Edge를 snap_point에서 분할하여 가상 노드 삽입
    
    (u, v, key)를 (u -> virtual_node), (virtual_node -> v)로 분할
    """
    attr = G.edges[u, v, key]
    geom_wkt = attr.get("geometry_wkt", "")
    
    if not geom_wkt:
        return
    
    try:
        geom = wkt.loads(geom_wkt)
        p = geom.interpolate(geom.project(snap_point))
        coords = list(geom.coords)
        
        if len(coords) < 2:
            return
        
        g1 = LineString([coords[0], (p.x, p.y)])
        g2 = LineString([(p.x, p.y), coords[-1]])
        
        l1, l2 = g1.length, g2.length
        if (l1 + l2) <= 0:
            return
        
        r1 = l1 / (l1 + l2)
        r2 = l2 / (l1 + l2)
        
        # 원본 edge 제거
        G.remove_edge(u, v, key)
        
        # 길이 비례 분할
        len1 = float(attr.get("length", 0.0)) * r1
        len2 = float(attr.get("length", 0.0)) * r2
        
        # 점수/컴포넌트 유지
        keep = {}
        keep["total_score"] = float(attr.get("total_score", 0.0))
        for kk, vv in attr.items():
            if str(kk).startswith("comp_"):
                keep[kk] = vv
        
        G.add_edge(u, virtual_node, length=len1, geometry_wkt=g1.wkt, **keep)
        G.add_edge(virtual_node, v, length=len2, geometry_wkt=g2.wkt, **keep)
    except Exception as e:
        print(f"Edge 분할 오류: {e}")


def extract_edges_for_path(
    G: nx.MultiGraph, path_nodes: List[int], weight_attr: str
) -> List[Tuple[int, int, int, Dict]]:
    """경로 노드 리스트에서 edge 데이터 추출"""
    edges = []
    for a, b in zip(path_nodes[:-1], path_nodes[1:]):
        data = G.get_edge_data(a, b)  # {key: attr}
        if not data:
            continue
        
        # 최소 weight를 가진 edge 선택
        k, attr = min(
            data.items(),
            key=lambda kv: float(kv[1].get(weight_attr, float("inf")))
        )
        edges.append((a, b, k, attr))
    
    return edges


def route_stats(
    edges: List[Tuple], length_attr: str = "length", score_attr: str = "total_score"
) -> Tuple[float, float]:
    """경로 통계 계산 (총 길이, 평균 점수)"""
    total_len = 0.0
    score_len_sum = 0.0
    
    for _, _, _, attr in edges:
        L = float(attr.get(length_attr, 0.0))
        s = _clamp01(float(attr.get(score_attr, 0.0)))
        total_len += L
        score_len_sum += s * L
    
    avg_score = (score_len_sum / total_len) if total_len > 0 else 0.0
    return total_len, avg_score


def lambda_sweep_best_path(
    G: nx.MultiGraph,
    source: int,
    target: int,
    detour_ratio: float = DETOUR_RATIO,
    lambdas: Tuple = LAMBDAS,
    length_attr: str = "length",
    score_attr: str = "total_score",
    cost_attr: str = "cost_lam",
    p: float = 2.0,
    L_ref: Optional[float] = None,
) -> Dict:
    """
    λ-sweep 알고리즘으로 detour budget 내 최고 점수 경로 탐색
    
    Args:
        G: MultiGraph
        source: 시작 노드
        target: 목표 노드
        detour_ratio: 우회 비율 (예: 1.2 = 최단 거리의 120%)
        lambdas: 테스트할 lambda 값들
        length_attr: 길이 속성명
        score_attr: 점수 속성명
        cost_attr: 임시 cost 속성명
        p: 점수 변환 지수
        L_ref: 길이 정규화 기준값 (None이면 median 자동 계산)
    
    Returns:
        {
            "baseline": {"len_m": ..., "avg_score": ..., "path_nodes": ..., "edges": ...},
            "budget_len_m": ...,
            "best": {"lambda": ..., "len_m": ..., "avg_score": ..., "path_nodes": ..., "edges": ...}
        }
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
    
    # Baseline: 최단 경로 (length만 사용)
    try:
        base_nodes = nx.dijkstra_path(G, source, target, weight=length_attr)
    except nx.NetworkXNoPath:
        raise ValueError(f"No path found from {source} to {target}")
    
    base_edges = extract_edges_for_path(G, base_nodes, weight_attr=length_attr)
    L0, S0 = route_stats(base_edges, length_attr=length_attr, score_attr=score_attr)
    
    L_budget = L0 * detour_ratio
    
    best = {
        "lambda": 0,
        "path_nodes": base_nodes,
        "edges": base_edges,
        "len_m": L0,
        "avg_score": S0,
    }
    
    # Lambda sweep
    for lam in lambdas:
        # 임시 cost 계산: cost = (length / L_ref) + λ * (1 - score)^p
        for _, _, _, data in G.edges(keys=True, data=True):
            L = float(data.get(length_attr, 0.0))
            s = _clamp01(float(data.get(score_attr, 0.0)))
            
            L_norm = L / L_ref
            data[cost_attr] = L_norm + lam * ((1.0 - s) ** p)
        
        try:
            nodes = nx.dijkstra_path(G, source, target, weight=cost_attr)
        except nx.NetworkXNoPath:
            continue
        
        edges = extract_edges_for_path(G, nodes, weight_attr=cost_attr)
        L, S = route_stats(edges, length_attr=length_attr, score_attr=score_attr)
        
        # Detour budget 내에서 최고 점수 선택
        if L <= L_budget:
            if (S > best["avg_score"]) or (
                abs(S - best["avg_score"]) < 1e-12 and L < best["len_m"]
            ):
                best = {
                    "lambda": lam,
                    "path_nodes": nodes,
                    "edges": edges,
                    "len_m": L,
                    "avg_score": S,
                }
    
    return {
        "baseline": {
            "len_m": L0,
            "avg_score": S0,
            "path_nodes": base_nodes,
            "edges": base_edges,
        },
        "budget_len_m": L_budget,
        "best": best,
    }


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
        except:
            continue
    
    return lines


class EcoPathFinder:
    """환경 친화적 경로 탐색기 (새로운 λ-sweep 알고리즘)"""
    
    def __init__(self, source_epsg: int = SOURCE_EPSG):
        self.source_epsg = source_epsg
        self.tf_to_wgs = Transformer.from_crs(
            f"EPSG:{source_epsg}", "EPSG:4326", always_xy=True
        )
        self.tf_to_epsg = Transformer.from_crs(
            "EPSG:4326", f"EPSG:{source_epsg}", always_xy=True
        )
        self.G: Optional[nx.MultiGraph] = None
        self.shadow_dict: Dict[int, float] = {}
    
    def build_graph(
        self,
        csv_path: Path,
        shadow_csv_path: Path,
        season: str,
    ):
        """그래프 구축"""
        # 그림자 데이터 준비
        now, current_season, shadow_col = get_current_season_and_shadow_col()
        self.shadow_dict = prepare_shadow_dict(shadow_csv_path, shadow_col)
        
        # 그래프 구축
        self.G = build_graph_from_csv(csv_path, season, shadow_dict=self.shadow_dict)
    
    def find_path_with_detour(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        detour_ratio: float = DETOUR_RATIO,
        lambdas: Tuple = LAMBDAS,
    ) -> Optional[Dict]:
        """
        시작점과 끝점 사이의 경로 탐색 (baseline + best)
        
        Returns:
            {
                "baseline": {"edges": ..., "len_m": ..., "avg_score": ...},
                "best": {"edges": ..., "len_m": ..., "avg_score": ...}
            }
        """
        if self.G is None:
            raise ValueError("Graph not built. Call build_graph() first.")
        
        # 가상 노드 설정
        start_virtual = -1000001
        end_virtual = -1000002
        
        # Snap & split
        snap_s = snap_point_to_nearest_edge(
            start_lat, start_lon, self.G, self.source_epsg
        )
        split_edge_by_key(
            self.G,
            snap_s["u"],
            snap_s["v"],
            snap_s["key"],
            snap_s["snap_point"],
            start_virtual,
        )
        
        snap_e = snap_point_to_nearest_edge(
            end_lat, end_lon, self.G, self.source_epsg
        )
        split_edge_by_key(
            self.G,
            snap_e["u"],
            snap_e["v"],
            snap_e["key"],
            snap_e["snap_point"],
            end_virtual,
        )
        
        try:
            # λ-sweep 실행
            res = lambda_sweep_best_path(
                self.G,
                start_virtual,
                end_virtual,
                detour_ratio=detour_ratio,
                lambdas=lambdas,
            )
            
            return res
        except Exception as e:
            print(f"경로 탐색 오류: {e}")
            return None
        finally:
            # 가상 노드 제거
            if self.G.has_node(start_virtual):
                self.G.remove_node(start_virtual)
            if self.G.has_node(end_virtual):
                self.G.remove_node(end_virtual)
    
    def path_to_polyline(self, edges: List[Tuple]) -> List[Tuple[float, float]]:
        """Edge 리스트를 polyline으로 변환"""
        lines = edges_to_latlon_lines(edges, self.source_epsg)
        
        # 모든 line을 하나의 polyline으로 합치기
        polyline = []
        for line in lines:
            polyline.extend(line)
        
        return polyline
