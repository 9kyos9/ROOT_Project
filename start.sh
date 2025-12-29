#!/bin/bash

# ROOT 프로젝트 서버 실행 스크립트

# PATH에 Node.js 추가 (Homebrew 설치 시)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=== ROOT 프로젝트 서버 시작 ==="

# 백엔드 서버 시작 (백그라운드)
echo "백엔드 서버 시작 중..."
cd backend
if [ ! -d "venv" ]; then
    echo "Python 가상환경 생성 중..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "백엔드 서버를 포트 8000에서 실행합니다..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 프론트엔드 서버 시작
echo "프론트엔드 서버 시작 중..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "npm 패키지 설치 중..."
    npm install
fi

echo "프론트엔드 서버를 포트 3000에서 실행합니다..."
npm start

# 정리 함수
cleanup() {
    echo ""
    echo "서버 종료 중..."
    kill $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

