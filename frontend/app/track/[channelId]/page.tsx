type TrackData = {
  session_id: string;
  code: string;
  platform: "tiktok" | "instagram" | "x";
  channel: string;
};

async function getTrackData(channelId: string): Promise<TrackData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${apiUrl}/track/${channelId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const PLATFORM_CONFIG = {
  tiktok: {
    name: "TikTok",
    bg: "#010101",
    accent: "#FE2C55",
    accent2: "#25F4EE",
    icon: "♪",
    iconBg: "#FE2C55",
    accountName: "@yourtiktok",
    bio: "TikTokで毎日役立つ情報を発信中📱\nフォローして最新情報をチェック！",
    tags: ["#TikTok", "#毎日投稿", "#役立つ情報"],
    posts: ["投稿 128", "フォロワー 2.4万", "フォロー中 312"],
    codeNote: "フォロー後、固定投稿にコメント",
    steps: (code: string) => [
      "TikTokアカウントをフォロー",
      `固定投稿に「${code}」をコメント`,
    ],
    btnText: "TikTok をフォローする",
    url: "https://www.tiktok.com",
  },
  instagram: {
    name: "Instagram",
    bg: "#0a0008",
    accent: "#E1306C",
    accent2: "#833AB4",
    icon: "◎",
    iconBg: "linear-gradient(45deg, #833AB4, #E1306C)",
    accountName: "@yourinsta",
    bio: "Instagramで日常・お役立ち情報を発信✨\nフォローよろしくお願いします！",
    tags: ["#インスタ", "#毎日更新", "#フォロー歓迎"],
    posts: ["投稿 84", "フォロワー 1.8万", "フォロー中 201"],
    codeNote: "フォロー後、DMでコードを送信",
    steps: (code: string) => [
      "Instagramアカウントをフォロー",
      `DMで「${code}」を送る`,
    ],
    btnText: "Instagram をフォローする",
    url: "https://www.instagram.com",
  },
  x: {
    name: "X",
    bg: "#000000",
    accent: "#ffffff",
    accent2: "#1d9bf0",
    icon: "𝕏",
    iconBg: "#111",
    accountName: "@yourxaccount",
    bio: "Xで毎日ためになる情報をポスト中🔥\nフォローお待ちしています！",
    tags: ["#X", "#毎日ポスト", "#有益情報"],
    posts: ["ポスト 2,341", "フォロワー 9,800", "フォロー中 512"],
    codeNote: "フォロー後、固定ポストにリプライ",
    steps: (code: string) => [
      "Xアカウントをフォロー",
      `固定ポストに「${code}」をリプライ`,
    ],
    btnText: "X をフォローする",
    url: "https://www.x.com",
  },
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const data = await getTrackData(channelId);

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <p style={{ color: "#fff" }}>ページが見つかりません。</p>
      </main>
    );
  }

  const c = PLATFORM_CONFIG[data.platform] ?? PLATFORM_CONFIG.tiktok;

  return (
    <main style={{
      minHeight: "100vh",
      background: c.bg,
      fontFamily: "'Helvetica Neue', 'Hiragino Sans', sans-serif",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: "400px", width: "100%" }}>

        {/* アカウントプロフィール */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {/* アバター */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: c.iconBg, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", border: `2px solid ${c.accent}`,
          }}>
            {c.icon}
          </div>
          <p style={{ fontWeight: "800", fontSize: "18px", margin: "0 0 4px" }}>{c.accountName}</p>
          <p style={{ color: "#666", fontSize: "13px", margin: "0 0 12px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
            {c.bio}
          </p>
          {/* タグ */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            {c.tags.map(tag => (
              <span key={tag} style={{ color: c.accent2, fontSize: "12px" }}>{tag}</span>
            ))}
          </div>
          {/* 統計 */}
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "12px 0" }}>
            {c.posts.map(stat => (
              <p key={stat} style={{ color: "#666", fontSize: "12px", margin: 0 }}>{stat}</p>
            ))}
          </div>
        </div>

        {/* コードボックス */}
        <div style={{
          background: "#111",
          border: `1px solid ${c.accent}`,
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <p style={{ color: "#555", fontSize: "11px", letterSpacing: "2px", marginBottom: "10px" }}>
            認証コード
          </p>
          <p style={{
            fontSize: "40px", fontWeight: "900", letterSpacing: "6px",
            margin: "0 0 8px", color: "#fff",
            textShadow: `0 0 20px ${c.accent}`,
          }}>
            {data.code}
          </p>
          <p style={{ color: "#555", fontSize: "12px" }}>{c.codeNote}</p>
        </div>

        {/* ステップ */}
        <div style={{ marginBottom: "24px" }}>
          {c.steps(data.code).map((text, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: c.accent, color: data.platform === "x" ? "#000" : "#fff",
                fontSize: "12px", fontWeight: "bold",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <p style={{ color: "#ccc", fontSize: "14px", margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* フォローボタン */}
        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", padding: "16px",
            background: c.accent,
            color: data.platform === "x" ? "#000" : "#fff",
            textAlign: "center", borderRadius: "12px",
            textDecoration: "none", fontWeight: "800", fontSize: "16px",
          }}
        >
          {c.btnText}
        </a>

        <p style={{ color: "#222", fontSize: "11px", marginTop: "24px", textAlign: "center" }}>
          {data.session_id}
        </p>
      </div>
    </main>
  );
}
