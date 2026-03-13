"use client";

import { useEffect, useState } from "react";
import QRCell from "./components/QRCell";

type Row = {
  channel_id: string;
  channel_name: string;
  platform: string;
  clicks: number;
  verified: number;
  cvr: number;
};

type LineRow = {
  channel_id: string;
  channel_name: string;
  source: string;
  short_code: string;
  clicks: number;
  verified: number;
  cvr: number;
};

const PLATFORM_LABEL: Record<string, { label: string; color: string }> = {
  tiktok:    { label: "TikTok",    color: "#FE2C55" },
  instagram: { label: "Instagram", color: "#E1306C" },
  x:         { label: "X",         color: "#1d9bf0" },
};

const API_URL = "";
const POLL_INTERVAL = 30_000; // 30秒

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lineRows, setLineRows] = useState<LineRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const [statsRes, lineRes] = await Promise.all([
        fetch(`${API_URL}/track/dashboard/stats`, { cache: "no-store" }),
        fetch(`${API_URL}/track/dashboard/line`, { cache: "no-store" }),
      ]);
      if (statsRes.ok) setRows(await statsRes.json());
      if (lineRes.ok) setLineRows(await lineRes.json());
      setLastUpdated(new Date());
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const platforms = ["tiktok", "instagram", "x"];

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", padding: "40px 24px", fontFamily: "'Helvetica Neue', 'Hiragino Sans', sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "8px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>
            フォロワー流入 ダッシュボード
          </h1>
          {lastUpdated && (
            <span style={{ fontSize: "11px", color: "#444" }}>
              最終更新: {lastUpdated.toLocaleTimeString("ja-JP")}
            </span>
          )}
        </div>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "40px" }}>
          チャネル別クリック数・フォロー確認数・CVR（30秒ごと自動更新）
        </p>

        {/* LINE セクション */}
        {(() => {
          const lineColor = "#06C755";
          const totalClicks = lineRows.reduce((s, r) => s + r.clicks, 0);
          const totalVerified = lineRows.reduce((s, r) => s + r.verified, 0);
          const totalCvr = totalClicks > 0 ? Math.round(totalVerified / totalClicks * 1000) / 10 : 0;
          return (
            <section style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color: lineColor, margin: 0 }}>LINE</h2>
                <div style={{ display: "flex", gap: "16px", marginLeft: "auto" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>合計クリック <strong style={{ color: "#fff" }}>{totalClicks}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>友だち追加 <strong style={{ color: "#fff" }}>{totalVerified}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>CVR <strong style={{ color: lineColor }}>{totalCvr}%</strong></span>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <th style={th}>チャネルID</th>
                    <th style={th}>経路</th>
                    <th style={{ ...th, textAlign: "right" }}>クリック</th>
                    <th style={{ ...th, textAlign: "right" }}>友だち追加</th>
                    <th style={{ ...th, textAlign: "right" }}>CVR</th>
                    <th style={{ ...th, textAlign: "center" }}>URL / QR</th>
                  </tr>
                </thead>
                <tbody>
                  {lineRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: "center", color: "#333", padding: "24px" }}>
                        データなし
                      </td>
                    </tr>
                  ) : (
                    lineRows.map((r) => (
                      <tr key={r.channel_id} style={{ borderBottom: "1px solid #111" }}>
                        <td style={{ ...td, color: "#555", fontSize: "12px", fontFamily: "monospace" }}>{r.short_code}</td>
                        <td style={td}>{r.channel_name}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.clicks}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.verified}</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: "bold", color: r.cvr >= 30 ? "#4ade80" : "#fff" }}>
                          {r.cvr}%
                        </td>
                        <td style={{ ...td, textAlign: "center" }}>
                          <QRCell
                            channelId={r.short_code}
                            color={lineColor}
                            urlOverride={`https://line-tracker-rust.vercel.app/l/${r.short_code}`}
                            qrUrlOverride={`https://line-tracker-rust.vercel.app/api/qr/${r.short_code}`}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          );
        })()}

        {platforms.map((platform) => {
          const platformRows = rows.filter((r) => r.platform === platform);
          const { label, color } = PLATFORM_LABEL[platform];
          const totalClicks = platformRows.reduce((s, r) => s + r.clicks, 0);
          const totalVerified = platformRows.reduce((s, r) => s + r.verified, 0);
          const totalCvr = totalClicks > 0 ? Math.round(totalVerified / totalClicks * 1000) / 10 : 0;

          return (
            <section key={platform} style={{ marginBottom: "48px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color, margin: 0 }}>{label}</h2>
                <div style={{ display: "flex", gap: "16px", marginLeft: "auto" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>合計クリック <strong style={{ color: "#fff" }}>{totalClicks}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>フォロー確認 <strong style={{ color: "#fff" }}>{totalVerified}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>CVR <strong style={{ color }}>{totalCvr}%</strong></span>
                </div>
              </div>

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
