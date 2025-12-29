from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import route

app = FastAPI(title="ROOT Project API")

# CORS 설정 (프론트엔드와 통신을 위해 필요)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(route.router)

@app.get("/")
async def read_root():
    return {"message": "ROOT Project API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}