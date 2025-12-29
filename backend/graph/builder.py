"""
네트워크 그래프 빌더
CSV 파일에서 도로 네트워크 데이터를 로드하고 그래프 구조로 변환합니다.
"""
import pandas as pd
import networkx as nx
from pathlib import Path
from typing import Dict, Tuple, Optional


class GraphBuilder:
    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            data_dir = Path(__file__).parent.parent / "data"
        self.data_dir = data_dir
        self.graph: Optional[nx.DiGraph] = None
        self.links_df: Optional[pd.DataFrame] = None
        self.node_coords: Dict[int, Tuple[float, float]] = {}

    def load_data(self):
        """CSV 파일에서 링크 데이터 로드"""
        links_file = self.data_dir / "jongno_links_with_score.csv"
        self.links_df = pd.read_csv(links_file)

        # 컬럼명 정규화 (한글 컬럼명을 영어로 매핑)
        column_mapping = {
            '링크 ID': 'link_id',
            '시작노드 ID': 'start_node_id',
            '종료노드 ID': 'end_node_id',
            'link_len_m': 'link_len_m',
            'geometry_wkt': 'geometry_wkt',
            'flower_score': 'flower_score',
            'shelter_score': 'shelter_score',
            'tour_score': 'tour_score',
            'streetfood_score': 'streetfood_score',
        }
        
        for korean, english in column_mapping.items():
            if korean in self.links_df.columns:
                self.links_df.rename(columns={korean: english}, inplace=True)

        # 숫자 타입으로 변환
        numeric_cols = ['link_id', 'start_node_id', 'end_node_id', 'link_len_m',
                       'flower_score', 'shelter_score', 'tour_score', 'streetfood_score']
        for col in numeric_cols:
            if col in self.links_df.columns:
                self.links_df[col] = pd.to_numeric(self.links_df[col], errors='coerce')

        # NaN 값 처리
        score_cols = ['flower_score', 'shelter_score', 'tour_score', 'streetfood_score']
        for col in score_cols:
            if col in self.links_df.columns:
                self.links_df[col] = self.links_df[col].fillna(0.0)

    def build_graph(self):
        """네트워크 그래프 구축"""
        if self.links_df is None:
            self.load_data()

        self.graph = nx.DiGraph()

        # 링크를 엣지로 추가
        for _, row in self.links_df.iterrows():
            link_id = int(row['link_id'])
            start_node = int(row['start_node_id'])
            end_node = int(row['end_node_id'])
            length = float(row['link_len_m'])

            # 노드 좌표 정보 추출 (geometry_wkt에서 좌표 추출)
            if pd.notna(row.get('geometry_wkt')):
                geometry = row['geometry_wkt']
                # LINESTRING에서 좌표 추출
                if 'LINESTRING' in str(geometry):
                    try:
                        coords_str = str(geometry).split('(')[1].split(')')[0]
                        first_coord = coords_str.split(',')[0].strip().split()
                        if len(first_coord) >= 2:
                            x, y = float(first_coord[0]), float(first_coord[1])
                            if start_node not in self.node_coords:
                                self.node_coords[start_node] = (x, y)
                        # 종료 노드 좌표도 추가
                        last_coord = coords_str.split(',')[-1].strip().split()
                        if len(last_coord) >= 2:
                            x, y = float(last_coord[0]), float(last_coord[1])
                            if end_node not in self.node_coords:
                                self.node_coords[end_node] = (x, y)
                    except:
                        pass

            # 엣지 데이터 저장
            self.graph.add_edge(
                start_node,
                end_node,
                link_id=link_id,
                length=length,
                geometry_wkt=row.get('geometry_wkt', ''),
                flower_score=float(row.get('flower_score', 0.0)),
                shelter_score=float(row.get('shelter_score', 0.0)),
                tour_score=float(row.get('tour_score', 0.0)),
                streetfood_score=float(row.get('streetfood_score', 0.0)),
            )

    def get_graph(self) -> nx.DiGraph:
        """구축된 그래프 반환"""
        if self.graph is None:
            self.build_graph()
        return self.graph

    def get_node_coords(self) -> Dict[int, Tuple[float, float]]:
        """노드 좌표 정보 반환"""
        if not self.node_coords:
            self.build_graph()
        return self.node_coords

