import random
import string
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.database import get_db
from app.models.channel import Channel
from app.models.session import Session
from app.config import settings

router = APIRouter(prefix="/track", tags=["track"])


def generate_code(platform: str) -> str:
    prefix = {"tiktok": "TK", "instagram": "IG", "x": "XP"}.get(platform, "XX")
    number = "".join(random.choices(string.digits, k=4))
    return f"{prefix}-{number}"


@router.get("/{channel_id}")
async def track_click(channel_id: str, db: AsyncSession = Depends(get_db)):
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # 重複しないコード生成
    for _ in range(10):
        code = generate_code(channel.platform)
        existing = await db.execute(select(Session).where(Session.code == code))
        if not existing.scalar_one_or_none():
            break

    session = Session(
        platform=channel.platform,
        channel_id=channel_id,
        code=code,
        status="CLICKED",
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": str(session.id),
        "code": session.code,
        "platform": channel.platform,
        "channel": channel.name,
    }


class DashboardRow(BaseModel):
    channel_id: str
    channel_name: str
    platform: str
    clicks: int
    verified: int
    cvr: float


@router.get("/dashboard/stats", response_model=list[DashboardRow])
async def dashboard_stats(platform: str | None = None, db: AsyncSession = Depends(get_db)):
    query = (
        select(
            Channel.id,
            Channel.name,
            Channel.platform,
            func.count(Session.id).label("clicks"),
            func.count(Session.verified_at).label("verified"),
        )
        .join(Session, Session.channel_id == Channel.id, isouter=True)
        .group_by(Channel.id, Channel.name, Channel.platform)
    )
    if platform:
        query = query.where(Channel.platform == platform)

    result = await db.execute(query)
    rows = result.all()

    return [
        DashboardRow(
            channel_id=r.id,
            channel_name=r.name,
            platform=r.platform,
            clicks=r.clicks,
            verified=r.verified,
            cvr=round(r.verified / r.clicks * 100, 1) if r.clicks > 0 else 0.0,
        )
        for r in rows
    ]


class LineDashboardRow(BaseModel):
    channel_id: str
    channel_name: str
    source: str
    short_code: str
    clicks: int
    verified: int
    cvr: float


@router.get("/dashboard/line", response_model=list[LineDashboardRow])
async def dashboard_line_stats():
    url = f"{settings.LINE_SUPABASE_URL}/rest/v1/channel_summary?select=*"
    headers = {
        "apikey": settings.LINE_SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.LINE_SUPABASE_SERVICE_ROLE_KEY}",
    }
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch LINE data")

    return [
        LineDashboardRow(
            channel_id=str(r["id"]),
            channel_name=r["name"],
            source=r.get("source", ""),
            short_code=r.get("short_code", ""),
            clicks=r.get("click_count", 0),
            verified=r.get("follow_count", 0),
            cvr=float(r.get("cvr", 0)),
        )
        for r in res.json()
    ]
