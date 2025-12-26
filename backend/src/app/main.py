from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis

from .api import router as api_router

async def client_ip(req: Request) -> str: # NOSONAR
    # Gets actual client-IP, when reverse proxy is used
    xff = req.headers.get("x-forwarded-for")
    return xff.split(",")[0].strip() if xff else req.client.host

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    r = redis.from_url(
        "redis://redis:6379/0",  # Hostname specified in docker-compose
        encoding="utf-8",
        decode_responses=True
    )
    await FastAPILimiter.init(r, identifier=client_ip)
    yield
    # Shutdown
    await r.close()

app = FastAPI(lifespan=lifespan)

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

app.include_router(
    api_router,
    dependencies=[Depends(RateLimiter(times=10, seconds=60))]
)


@app.get("/", dependencies=[Depends(RateLimiter(times=10, seconds=10))])
async def root():
    return {
        "message": "Welcome to the Amberg Waste Collection API",
        "docs": "/docs"
    }

@app.get("/ping", dependencies=[Depends(RateLimiter(times=10, seconds=10))])
async def ping():
    return {"status": "ok"}