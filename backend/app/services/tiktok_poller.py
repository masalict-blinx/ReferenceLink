"""
TikTok フォロー確認ポーラー
- 固定動画のコメントを取得
- TK-XXXX 形式のコードを検出
- DBのセッションと照合してFOLLOW_VERIFIEDに更新
"""

import re
import logging
from datetime import datetime

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.session import Session

logger = logging.getLogger(__name__)

CODE_PATTERN = re.compile(r"\bTK-\d{4}\b")

TIKTOK_API_BASE = "https://open.tiktokapis.com"


async def poll_tiktok_comments():
    if not settings.TIKTOK_ACCESS_TOKEN:
        logger.warning("[TikTok Poller] TIKTOK_ACCESS_TOKEN が未設定のためスキップ")
        return
    if not settings.TIKTOK_PINNED_VIDEO_ID:
        logger.warning("[TikTok Poller] TIKTOK_PINNED_VIDEO_ID が未設定のためスキップ")
        return

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{TIKTOK_API_BASE}/v2/video/comment/list/",
                headers={"Authorization": f"Bearer {settings.TIKTOK_ACCESS_TOKEN}"},
                params={
                    "video_id": settings.TIKTOK_PINNED_VIDEO_ID,
                    "max_count": 50,
                    "fields": "id,text,create_time,like_count",
                },
                timeout=15,
            )

        if resp.status_code != 200:
            logger.error(f"[TikTok Poller] API エラー: {resp.status_code} {resp.text[:200]}")
            return

        data = resp.json()
        comments = data.get("data", {}).get("comments") or []

        if not comments:
            logger.info("[TikTok Poller] 新着コメントなし")
            return

        async with AsyncSessionLocal() as db:
            matched = 0
            for comment in comments:
                text = comment.get("text", "")
                codes = CODE_PATTERN.findall(text)
                for code in codes:
                    updated = await _process_comment(db, code, comment)
                    if updated:
                        matched += 1
            await db.commit()

        logger.info(f"[TikTok Poller] {len(comments)}件のコメントを処理 / {matched}件マッチ")

    except Exception as e:
        logger.error(f"[TikTok Poller] エラー: {e}")


async def _process_comment(db: AsyncSession, code: str, comment: dict) -> bool:
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
        session.platform_user_id = str(comment.get("id", ""))
        logger.info(f"[TikTok Poller] フォロー確認: code={code}")
        return True
    else:
        logger.debug(f"[TikTok Poller] 未マッチコード: {code}")
        return False
