"""
TikTok Webhook受信エンドポイント
コメントイベントを受信してFOLLOW_VERIFIEDに更新
"""

import re
import hashlib
import hmac
import logging
from datetime import datetime

from fastapi import APIRouter, Request, Response
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.session import Session

router = APIRouter(prefix="/webhook/tiktok", tags=["webhook"])
logger = logging.getLogger(__name__)

CODE_PATTERN = re.compile(r"\bTK-\d{4}\b")


@router.get("")
async def tiktok_webhook_verify(
    challenge: str = "",
):
    """TikTok Webhookの疎通確認（GET）"""
    return Response(content=challenge, media_type="text/plain")


@router.post("")
async def tiktok_webhook(request: Request):
    """TikTok Webhookイベント受信（POST）"""
    body = await request.body()

    # シグネチャ検証（設定されている場合）
    if settings.TIKTOK_CLIENT_SECRET:
        signature = request.headers.get("X-TikTok-Signature", "")
        expected = hmac.new(
            settings.TIKTOK_CLIENT_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if signature and signature != expected:
            logger.warning("[TikTok Webhook] シグネチャ不一致")
            return {"ok": False}

    try:
        data = await request.json()
    except Exception:
        return {"ok": True}

    event_type = data.get("event", "")
    logger.info(f"[TikTok Webhook] イベント受信: {event_type}")

    if event_type == "comment.create":
        comment_text = data.get("comment", {}).get("text", "")
        codes = CODE_PATTERN.findall(comment_text)

        async with AsyncSessionLocal() as db:
            for code in codes:
                result = await db.execute(
                    select(Session).where(
                        Session.code == code,
                        Session.platform == "tiktok",
                        Session.status != "FOLLOW_VERIFIED",
                    )
                )
                session = result.scalar_one_or_none()
                if session:
                    session.status = "FOLLOW_VERIFIED"
                    session.verified_at = datetime.utcnow()
                    logger.info(f"[TikTok Webhook] フォロー確認: code={code}")
            await db.commit()

    return {"ok": True}
