from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis

from .api import router as api_router
from .ip_utils import rate_limit_key_func

redis_available = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_available
    r = None
    try:
        r = redis.from_url(
            "redis://redis:6379/0",  # Hostname specified in docker-compose
            encoding="utf-8",
            decode_responses=True
        )
        await FastAPILimiter.init(r, identifier=rate_limit_key_func)
        redis_available = True
        yield
    except Exception:
        yield
    finally:
        if r:
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

rate_limiter_dep = [Depends(RateLimiter(times=10, seconds=60))] if redis_available else []
rate_limiter_dep_10 = [Depends(RateLimiter(times=10, seconds=10))] if redis_available else []

app.include_router(
    api_router,
    dependencies=rate_limiter_dep
)


@app.get("/", dependencies=rate_limiter_dep_10)
async def root():
    return {
        "message": "Welcome to the Amberg Waste Collection API",
        "docs": "/docs"
    }

@app.get("/ping", dependencies=rate_limiter_dep_10)
async def ping():
    return {"status": "ok"}