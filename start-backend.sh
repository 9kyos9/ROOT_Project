#!/bin/bash

# 백엔드 서버만 실행하는 스크립트

echo "=== 백엔드 서버 시작 ==="

cd backend

# 가상환경 확인 및 생성
if [ ! -d "venv" ]; then
    echo "Python 가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
if ! python -c "import fastapi" 2>/dev/null; then
    echo "의존성 설치 중..."
    pip install -r requirements.txt
fi

# 서버 실행
echo "백엔드 서버를 포트 8000에서 실행합니다..."
echo "API 문서: http://localhost:8000/docs"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

