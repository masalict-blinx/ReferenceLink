"""
X (Twitter) フォロー確認ポーラー
- 自分へのメンションを取得
- XP-XXXX 形式のコードを検出
- DBのセッションと照合してFOLLOW_VERIFIEDに更新
"""

import re
import logging
from datetime import datetime

import tweepy
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.session import Session

logger = logging.getLogger(__name__)

CODE_PATTERN = re.compile(r"\bXP-\d{4}\b")

# 最後に確認したメンションのIDを保持（重複処理防止）
_last_mention_id: str | None = None


def get_x_client() -> tweepy.Client:
    return tweepy.Client(
        bearer_token=settings.X_BEARER_TOKEN,
        consumer_key=settings.X_API_KEY,
        consumer_secret=settings.X_API_KEY_SECRET,
        access_token=settings.X_ACCESS_TOKEN,
        access_token_secret=settings.X_ACCESS_TOKEN_SECRET,
    )


def _is_following(client: tweepy.Client, my_id: int, author_id: int) -> bool:
    """author_id が自分（my_id）をフォローしているか確認"""
    try:
        # author_id のフォロー中リストに my_id が含まれるか確認
        resp = client.get_users_following(id=author_id, max_results=1000)
        if not resp.data:
            return False
        return any(u.id == my_id for u in resp.data)
    except Exception as e:
        logger.warning(f"[X Poller] フォロー確認APIエラー (user={author_id}): {e}")
        # API失敗時はメンションのみで確認済みとみなす
        return True


async def poll_x_mentions():
    global _last_mention_id

    if not settings.X_BEARER_TOKEN:
        logger.warning("[X Poller] X_BEARER_TOKEN が未設定のためスキップ")
        return

    try:
        client = get_x_client()

        # 自分のユーザーIDを取得
        me = client.get_me()
        if not me.data:
            logger.error("[X Poller] 自分のアカウント情報が取得できません")
            return

        my_id = me.data.id

        # メンション取得（最新20件）
        kwargs = dict(
            id=my_id,
            max_results=20,
            tweet_fields=["author_id", "text", "created_at"],
        )
        if _last_mention_id:
            kwargs["since_id"] = _last_mention_id

        mentions = client.get_users_mentions(**kwargs)

        if not mentions.data:
            logger.info("[X Poller] 新着メンションなし")
            return

        # 最新IDを保存（次回ポーリングで重複取得を防ぐ）
        _last_mention_id = str(mentions.data[0].id)

        async with AsyncSessionLocal() as db:
            for tweet in mentions.data:
                await _process_mention(db, client, my_id, tweet)
            await db.commit()

        logger.info(f"[X Poller] {len(mentions.data)}件のメンションを処理しました")

    except Exception as e:
        logger.error(f"[X Poller] エラー: {e}")


async def _process_mention(db: AsyncSession, client: tweepy.Client, my_id: int, tweet):
    """1件のメンションからコードを抽出してDBを更新"""
    text = tweet.text
    codes = CODE_PATTERN.findall(text)

    for code in codes:
        result = await db.execute(
            select(Session).where(
                Session.code == code,
                Session.platform == "x",
                Session.status != "FOLLOW_VERIFIED",
            )
        )
        session = result.scalar_one_or_none()

        if session:
            # フォロー状態を確認
            if not _is_following(client, my_id, tweet.author_id):
                logger.info(f"[X Poller] フォロー未確認のためスキップ: code={code} user={tweet.author_id}")
                continue

            session.status = "FOLLOW_VERIFIED"
            session.verified_at = datetime.utcnow()
            session.platform_user_id = str(tweet.author_id)
            logger.info(f"[X Poller] フォロー確認: code={code} user={tweet.author_id}")
        else:
            logger.debug(f"[X Poller] 未マッチコード: {code}")
