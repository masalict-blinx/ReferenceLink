import random
import string
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from app.database import get_db
from app.models.channel import Channel
from app.models.session import Session

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
