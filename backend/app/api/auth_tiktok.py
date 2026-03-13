"""
TikTok OAuth認証エンドポイント
アクセストークン取得用（初回セットアップ時に使用）
"""

import httpx
from fastapi import APIRouter
from fastapi.responses import RedirectResponse, HTMLResponse

from app.config import settings

router = APIRouter(prefix="/auth/tiktok", tags=["auth"])

TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
SCOPES = "user.info.basic"


@router.get("")
async def tiktok_login():
    """TikTok OAuth認証ページにリダイレクト"""
    params = (
        f"?client_key={settings.TIKTOK_CLIENT_KEY}"
        f"&scope={SCOPES}"
        f"&response_type=code"
        f"&redirect_uri={settings.APP_BASE_URL}/auth/tiktok/callback"
        f"&state=follower_tracker"
    )
    return RedirectResponse(TIKTOK_AUTH_URL + params)


@router.get("/callback")
async def tiktok_callback(code: str = "", error: str = ""):
    """TikTok OAuth コールバック"""
    if error:
        return HTMLResponse(f"<p>エラー: {error}</p>")
    if not code:
        return HTMLResponse("<p>codeが取得できませんでした</p>")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TIKTOK_TOKEN_URL,
            data={
                "client_key": settings.TIKTOK_CLIENT_KEY,
                "client_secret": settings.TIKTOK_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{settings.APP_BASE_URL}/auth/tiktok/callback",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )

    if resp.status_code != 200:
        return HTMLResponse(f"<p>トークン取得失敗: {resp.text}</p>")

    data = resp.json().get("data", {})
    access_token = data.get("access_token", "")
    refresh_token = data.get("refresh_token", "")
    open_id = data.get("open_id", "")

    return HTMLResponse(f"""
    <html><body style="font-family:sans-serif;padding:40px">
    <h2>TikTok 認証成功</h2>
    <p>以下の値をRailwayの環境変数に設定してください：</p>
    <table border="1" cellpadding="8">
      <tr><th>変数名</th><th>値</th></tr>
      <tr><td>TIKTOK_ACCESS_TOKEN</td><td><code>{access_token}</code></td></tr>
      <tr><td>TIKTOK_OPEN_ID</td><td><code>{open_id}</code></td></tr>
    </table>
    <p style="color:#888">refresh_token: {refresh_token}</p>
    <p>設定後、バックエンドを再デプロイしてください。</p>
    </body></html>
    """)
