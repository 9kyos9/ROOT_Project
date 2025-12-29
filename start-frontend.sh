#!/bin/bash

# 프론트엔드 서버만 실행하는 스크립트

# PATH에 Node.js 추가 (Homebrew 설치 시)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "=== 프론트엔드 서버 시작 ==="

cd frontend

# 의존성 설치
if [ ! -d "node_modules" ]; then
    echo "npm 패키지 설치 중..."
    npm install
fi

# 서버 실행
echo "프론트엔드 서버를 포트 3000에서 실행합니다..."
npm start