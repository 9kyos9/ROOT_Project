"""
경로 API 스키마
"""
from pydantic import BaseModel
from typing import List, Optional, Literal


class Place(BaseModel):
    """관광지 정보"""
    id: Optional[str] = None
    name: Optional[str] = None
    lat: float
    lng: float


class StartLocation(BaseModel):
    """시작 위치"""
    lat: float
    lng: float


class RouteRequest(BaseModel):
    """경로 계산 요청"""
    start: StartLocation
    places: List[Place]
    season: Literal["summer", "winter", "spring", "fall"] = "summer"


class RouteResponse(BaseModel):
    """경로 계산 응답"""
    recommended: dict
    shortest: dict

