from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform: Mapped[str] = mapped_column(String(20))  # 'tiktok' or 'instagram'
    channel_id: Mapped[str] = mapped_column(String(50), ForeignKey("channels.id"))
    code: Mapped[str] = mapped_column(String(10), unique=True)  # 例: TK-7391, BX-4829
    clicked_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    verified_at: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    platform_user_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="CLICKED")
    # ステータス: CLICKED → DM_RECEIVED / COMMENT_RECEIVED → FOLLOW_VERIFIED
