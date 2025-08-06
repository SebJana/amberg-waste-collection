from fastapi import FastAPI
from src.app.api import router as api_router

app = FastAPI()

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to the Amberg Waste Collection API",
        "docs": "/docs"
    }

@app.get("/ping")
def ping():
    return {"status": "ok"}