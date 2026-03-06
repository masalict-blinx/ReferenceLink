import QRCell from "./components/QRCell";

type Row = {
  channel_id: string;
  channel_name: string;
  platform: string;
  clicks: number;
  verified: number;
  cvr: number;
};

async function getStats(): Promise<Row[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${apiUrl}/track/dashboard/stats`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const PLATFORM_LABEL: Record<string, { label: string; color: string }> = {
  tiktok:    { label: "TikTok",    color: "#FE2C55" },
  instagram: { label: "Instagram", color: "#E1306C" },
  x:         { label: "X",         color: "#1d9bf0" },
};

export default async function DashboardPage() {
  const rows = await getStats();

  const platforms = ["tiktok", "instagram", "x"];

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", padding: "40px 24px", fontFamily: "'Helvetica Neue', 'Hiragino Sans', sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
          フォロワー流入 ダッシュボード
        </h1>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "40px" }}>
          チャネル別クリック数・フォロー確認数・CVR
        </p>

        {platforms.map((platform) => {
          const platformRows = rows.filter((r) => r.platform === platform);
          const { label, color } = PLATFORM_LABEL[platform];
          const totalClicks = platformRows.reduce((s, r) => s + r.clicks, 0);
          const totalVerified = platformRows.reduce((s, r) => s + r.verified, 0);
          const totalCvr = totalClicks > 0 ? Math.round(totalVerified / totalClicks * 1000) / 10 : 0;

          return (
            <section key={platform} style={{ marginBottom: "48px" }}>
              {/* セクションヘッダー */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color, margin: 0 }}>{label}</h2>
                <div style={{ display: "flex", gap: "16px", marginLeft: "auto" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>合計クリック <strong style={{ color: "#fff" }}>{totalClicks}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>フォロー確認 <strong style={{ color: "#fff" }}>{totalVerified}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>CVR <strong style={{ color }}>{totalCvr}%</strong></span>
                </div>
              </div>

              {/* テーブル */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <th style={th}>チャネルID</th>
                    <th style={th}>経路</th>
                    <th style={{ ...th, textAlign: "right" }}>クリック</th>
                    <th style={{ ...th, textAlign: "right" }}>フォロー確認</th>
                    <th style={{ ...th, textAlign: "right" }}>CVR</th>
                    <th style={{ ...th, textAlign: "center" }}>URL / QR</th>
                  </tr>
                </thead>
                <tbody>
                  {platformRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: "center", color: "#333", padding: "24px" }}>
                        データなし
                      </td>
                    </tr>
                  ) : (
                    platformRows.map((r) => (
                      <tr key={r.channel_id} style={{ borderBottom: "1px solid #111" }}>
                        <td style={{ ...td, color: "#555", fontSize: "12px", fontFamily: "monospace" }}>{r.channel_id}</td>
                        <td style={td}>{r.channel_name}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.clicks}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.verified}</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: "bold", color: r.cvr >= 30 ? "#4ade80" : "#fff" }}>
                          {r.cvr}%
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>
                          <QRCell channelId={r.channel_id} color={color} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "600",
  color: "#444",
  fontSize: "12px",
};

const td: React.CSSProperties = {
  padding: "12px",
  color: "#ccc",
};
