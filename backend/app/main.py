import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import channels, track
from app.api import auth_tiktok, webhook_tiktok
from app.services.x_poller import poll_x_mentions
from app.services.tiktok_poller import poll_tiktok_comments

logging.basicConfig(level=logging.INFO)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時: ポーリングスケジューラを開始
    scheduler.add_job(poll_x_mentions, "interval", minutes=5, id="x_poller")
    scheduler.add_job(poll_tiktok_comments, "interval", minutes=5, id="tiktok_poller")
    scheduler.start()
    yield
    # 終了時: スケジューラを停止
    scheduler.shutdown()


app = FastAPI(title="Follower Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://frontend-production-c3e3.up.railway.app",
        "https://frontend-sable-six-luz2ph0zf4.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(channels.router)
app.include_router(track.router)
app.include_router(auth_tiktok.router)
app.include_router(webhook_tiktok.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/poll/x")
async def manual_poll_x():
    """手動でXメンションをポーリング（テスト用）"""
    await poll_x_mentions()
    return {"ok": True}
