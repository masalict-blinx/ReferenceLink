import io
import qrcode
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.channel import Channel
from app.config import settings

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelCreate(BaseModel):
    id: str
    platform: str
    name: str
    description: str | None = None


class ChannelResponse(BaseModel):
    id: str
    platform: str
    name: str
    description: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ChannelResponse])
async def list_channels(platform: str | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Channel)
    if platform:
        query = query.where(Channel.platform == platform)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ChannelResponse)
async def create_channel(data: ChannelCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(Channel, data.id)
    if existing:
        raise HTTPException(status_code=400, detail="Channel ID already exists")
    channel = Channel(**data.model_dump())
    db.add(channel)
    await db.commit()
    await db.refresh(channel)
    return channel


@router.delete("/{channel_id}")
async def delete_channel(channel_id: str, db: AsyncSession = Depends(get_db)):
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    await db.delete(channel)
    await db.commit()
    return {"ok": True}


@router.get("/{channel_id}/qr")
async def get_qr(channel_id: str, db: AsyncSession = Depends(get_db)):
    channel = await db.get(Channel, channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    url = f"{settings.APP_BASE_URL.replace('8000', '3000')}/track/{channel_id}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=qr-{channel_id}.png"},
    )
