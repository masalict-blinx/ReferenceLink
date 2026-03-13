from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/follower_tracker"
    APP_BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    TIKTOK_CLIENT_KEY: str = ""
    TIKTOK_CLIENT_SECRET: str = ""
    TIKTOK_ACCESS_TOKEN: str = ""
    TIKTOK_PINNED_VIDEO_ID: str = ""

    INSTAGRAM_ACCESS_TOKEN: str = ""
    INSTAGRAM_PAGE_ID: str = ""
    INSTAGRAM_VERIFY_TOKEN: str = ""

    X_API_KEY: str = ""
    X_API_KEY_SECRET: str = ""
    X_ACCESS_TOKEN: str = ""
    X_ACCESS_TOKEN_SECRET: str = ""
    X_BEARER_TOKEN: str = ""

    LINE_SUPABASE_URL: str = "https://madurhckjgugykipdmed.supabase.co"
    LINE_SUPABASE_SERVICE_ROLE_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
