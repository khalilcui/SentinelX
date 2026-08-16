from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.database import session as db_session
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routers import assessments, auth, network_assessments, reports

import app.models  # noqa: F401  (ensures models are registered on Base before create_all)

settings = get_settings()

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="SentinelX API",
    description="AI-Powered Cybersecurity Assessment Platform — backend API",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(exc.errors())})


@app.on_event("startup")
def on_startup():
    db_session.Base.metadata.create_all(bind=db_session.engine)


@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "SentinelX API"}


app.include_router(auth.router)
app.include_router(assessments.router)
app.include_router(network_assessments.router)
app.include_router(reports.router)
