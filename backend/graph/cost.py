"""
비용 계산 모듈
계절별 가중치를 적용하여 링크의 비용을 계산합니다.
"""
from typing import Dict


class CostCalculator:
    """계절별 가중치를 적용한 비용 계산기"""

    # 계절별 가중치 (중요도 제곱)
    SEASON_WEIGHTS = {
        "summer": {
            "shade": 81,      # 그늘 (9^2)
            "wind": 81,       # 풍속 (9^2)
            "shelter": 81,    # 무더위 쉼터 (9^2)
            "tour": 81,       # 관광지 (9^2)
            "total": 324,     # 총합
        },
        "winter": {
            "sunshine": 81,   # 햇빛 (9^2) - shade_score의 반대
            "wind": 81,       # 풍속 (9^2)
            "streetfood": 81, # 길거리 먹거리 (9^2)
            "tour": 81,       # 관광지 (9^2)
            "total": 324,     # 총합
        }
    }

    @staticmethod
    def calculate_link_cost(
        length: float,
        link_data: Dict,
        season: str = "summer",
        wind_score: float = 0.5  # 기본값 (shadow_score 데이터에서 가져와야 함)
    ) -> float:
        """
        링크의 비용 계산
        
        Args:
            length: 링크 길이 (미터)
            link_data: 링크 데이터 (scores 포함)
            season: 계절 ("summer" 또는 "winter")
            wind_score: 풍속 점수 (0~1)
        
        Returns:
            계산된 비용 (낮을수록 좋음)
        """
        weights = CostCalculator.SEASON_WEIGHTS.get(season, CostCalculator.SEASON_WEIGHTS["summer"])
        
        # 기본 거리 비용
        distance_cost = length

        # 점수 추출 (0~1 범위)
        # shade_score는 shadow_score 데이터에서 가져와야 하지만, 현재는 기본값 사용
        shade_score = float(link_data.get("shade_score", 0.5))  # 기본값 0.5 (그림자 없음 = 햇빛 좋음)
        shelter_score = float(link_data.get("shelter_score", 0.0))
        tour_score = float(link_data.get("tour_score", 0.0))
        streetfood_score = float(link_data.get("streetfood_score", 0.0))
        flower_score = float(link_data.get("flower_score", 0.0))

        # 점수는 높을수록 좋으므로 비용에서 빼기 (1 - score)
        if season == "summer":
            # 여름: 그늘, 풍속, 쉼터, 관광지 중요
            shade_penalty = (1.0 - shade_score) * weights["shade"] / weights["total"]
            wind_penalty = (1.0 - wind_score) * weights["wind"] / weights["total"]
            shelter_penalty = (1.0 - shelter_score) * weights["shelter"] / weights["total"]
            tour_penalty = (1.0 - tour_score) * weights["tour"] / weights["total"]
            
            cost = distance_cost * (1 + shade_penalty + wind_penalty + shelter_penalty + tour_penalty)
        
        else:  # winter
            # 겨울: 햇빛, 풍속, 먹거리, 관광지 중요
            sunshine_penalty = shade_score * weights["sunshine"] / weights["total"]  # 햇빛 = 그늘 반대
            wind_penalty = (1.0 - wind_score) * weights["wind"] / weights["total"]
            streetfood_penalty = (1.0 - streetfood_score) * weights["streetfood"] / weights["total"]
            tour_penalty = (1.0 - tour_score) * weights["tour"] / weights["total"]
            
            cost = distance_cost * (1 + sunshine_penalty + wind_penalty + streetfood_penalty + tour_penalty)

        return cost

    @staticmethod
    def calculate_link_score(
        link_data: Dict,
        season: str = "summer",
        wind_score: float = 0.5
    ) -> float:
        """
        링크의 환경 점수 계산 (0~100)
        
        Args:
            link_data: 링크 데이터
            season: 계절
            wind_score: 풍속 점수
        
        Returns:
            환경 점수 (0~100, 높을수록 좋음)
        """
        weights = CostCalculator.SEASON_WEIGHTS.get(season, CostCalculator.SEASON_WEIGHTS["summer"])
        
        shade_score = float(link_data.get("shade_score", 0.5))
        shelter_score = float(link_data.get("shelter_score", 0.0))
        tour_score = float(link_data.get("tour_score", 0.0))
        streetfood_score = float(link_data.get("streetfood_score", 0.0))

        if season == "summer":
            score = (
                shade_score * weights["shade"] +
                wind_score * weights["wind"] +
                shelter_score * weights["shelter"] +
                tour_score * weights["tour"]
            ) / weights["total"]
        else:  # winter
            sunshine_score = 1.0 - shade_score  # 햇빛 = 그늘 반대
            score = (
                sunshine_score * weights["sunshine"] +
                wind_score * weights["wind"] +
                streetfood_score * weights["streetfood"] +
                tour_score * weights["tour"]
            ) / weights["total"]

        return score * 100  # 0~100 스케일로 변환

