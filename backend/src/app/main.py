from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from fastapi.middleware.gzip import GZipMiddleware
import redis.asyncio as redis

from .routes import router as api_router
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
            decode_responses=True,
        )
        await FastAPILimiter.init(r, identifier=rate_limit_key_func)
        redis_available = True
        yield
    except Exception:
        yield
    finally:
        if r:
            await r.close()


app = FastAPI(
    title="Amberg Waste Collection API",
    description=(
        "API for accessing waste collection schedules and street/zone mappings for "
        "Amberg. Use the interactive docs at /docs or the OpenAPI spec at /openapi.json."
    ),
    version="1.0.0",
    contact={"name": "Amberg Waste Collection", "email": "support@example.com"},
    license_info={"name": "MIT"},
    lifespan=lifespan,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

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

# Compress API responses bigger than 1kb (especially relevant for the coordinates mapping)
# Since the file is over 1mb and on slow network connections that could trigger the max timeout of an API call
app.add_middleware(GZipMiddleware, minimum_size=1024)

rate_limiter_dep = (
    [Depends(RateLimiter(times=10, seconds=60))] if redis_available else []
)
rate_limiter_dep_10 = (
    [Depends(RateLimiter(times=10, seconds=10))] if redis_available else []
)

app.include_router(api_router, dependencies=rate_limiter_dep)


@app.get("/", dependencies=rate_limiter_dep_10)
async def root():
    return {"message": "Welcome to the Amberg Waste Collection API", "docs": "/docs"}


@app.get("/ping", dependencies=rate_limiter_dep_10)
async def ping():
    return {"status": "ok"}
