#!/bin/bash

# ROOT 프로젝트 서버 종료 스크립트

echo "=== ROOT 프로젝트 서버 종료 ==="

# 백엔드 서버 종료
echo "백엔드 서버 종료 중..."
pkill -9 -f "uvicorn main:app" 2>/dev/null
pkill -9 -f "uvicorn" 2>/dev/null
if [ $? -eq 0 ] || pgrep -f "uvicorn" > /dev/null; then
    echo "✓ 백엔드 서버 종료 완료"
else
    echo "  백엔드 서버가 실행 중이지 않습니다"
fi

# 프론트엔드 서버 종료
echo "프론트엔드 서버 종료 중..."
pkill -9 -f "react-scripts start" 2>/dev/null
pkill -9 -f "react-scripts" 2>/dev/null
pkill -9 -f "node.*start" 2>/dev/null
if [ $? -eq 0 ] || pgrep -f "react-scripts" > /dev/null; then
    echo "✓ 프론트엔드 서버 종료 완료"
else
    echo "  프론트엔드 서버가 실행 중이지 않습니다"
fi

# 포트 강제 해제
echo "포트 강제 해제 중..."
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 1

# 포트 확인
echo ""
echo "포트 상태 확인:"
lsof -i :8000 -i :3000 2>/dev/null | grep -E "LISTEN" || echo "  모든 포트가 비어있습니다"

echo ""
echo "서버 종료 완료!"

