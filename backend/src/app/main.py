from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.api import router as api_router

app = FastAPI()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://localhost:80",
        "http://frontend",
        "http://frontend:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to the Amberg Waste Collection API",
        "docs": "/docs"
    }

@app.get("/ping")
def ping():
    return {"status": "ok"}