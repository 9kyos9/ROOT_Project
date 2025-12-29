"""
경로 계산 API 라우터
"""
from fastapi import APIRouter, HTTPException
from schemas.route import RouteRequest, RouteResponse
from graph.pathfinder import PathFinder
import os
from pathlib import Path

router = APIRouter(prefix="/api/routes", tags=["routes"])

# 전역 패스파인더 인스턴스
_path_finder = None


def get_path_finder() -> PathFinder:
    """전역 PathFinder 인스턴스 반환 (싱글톤 패턴)"""
    global _path_finder
    
    if _path_finder is None:
        # 데이터 디렉토리 경로
        data_dir = Path(__file__).parent.parent / "data"
        _path_finder = PathFinder(data_dir)
    
    return _path_finder


@router.post("/calculate", response_model=dict)
async def calculate_route(request: RouteRequest):
    """
    경로 계산 API
    
    시작점과 관광지 목록을 받아 최적 경로와 최단 경로를 계산합니다.
    """
    try:
        # 시작점 좌표 추출
        start_lat = request.start.lat
        start_lng = request.start.lng

        # 관광지 좌표 리스트
        places = [{"lat": p.lat, "lng": p.lng, "name": p.name, "id": p.id} for p in request.places]

        if not places:
            raise HTTPException(status_code=400, detail="관광지가 필요합니다")

        # 경로 계산
        path_finder = get_path_finder()
        result = path_finder.find_route(
            start_lat=start_lat,
            start_lng=start_lng,
            places=places,
            season=request.season
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result

    except Exception as e:
        print(f"경로 계산 오류: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"경로 계산 중 오류가 발생했습니다: {str(e)}")

