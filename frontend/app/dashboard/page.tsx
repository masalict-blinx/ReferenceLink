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
const POLL_INTERVAL = 30_000;

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lineRows, setLineRows] = useState<LineRow[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchStats = async () => {
    try {
      const [statsRes, lineRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`, { cache: "no-store" }),
        fetch(`${API_URL}/api/dashboard/line`, { cache: "no-store" }),
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

  const openAdd = (platform: string) => {
    setAddingFor(platform);
    setNewId("");
    setNewName("");
  };

  const handleAdd = async (platform: string) => {
    if (!newId.trim() || !newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newId.trim(), platform, name: newName.trim() }),
      });
      if (res.ok) {
        setAddingFor(null);
        await fetchStats();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm(`チャネル「${channelId}」を削除しますか？`)) return;
    await fetch(`/api/channels/${channelId}`, { method: "DELETE" });
    await fetchStats();
  };

  const platforms = ["tiktok", "instagram", "x"];

  return (
    <main style={{ background: "#f8f8f8", minHeight: "100vh", padding: "40px 24px", fontFamily: "'Helvetica Neue', 'Hiragino Sans', sans-serif", color: "#111" }}>
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
                  <span style={{ fontSize: "12px", color: "#555" }}>合計クリック <strong style={{ color: "#111" }}>{totalClicks}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>友だち追加 <strong style={{ color: "#111" }}>{totalVerified}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>CVR <strong style={{ color: lineColor }}>{totalCvr}%</strong></span>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
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
                      <td colSpan={6} style={{ ...td, textAlign: "center", color: "#aaa", padding: "24px" }}>
                        データなし
                      </td>
                    </tr>
                  ) : (
                    lineRows.map((r) => (
                      <tr key={r.channel_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ ...td, color: "#888", fontSize: "12px", fontFamily: "monospace" }}>{r.short_code}</td>
                        <td style={td}>{r.channel_name}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.clicks}</td>
                        <td style={{ ...td, textAlign: "right" }}>{r.verified}</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: "bold", color: r.cvr >= 30 ? "#16a34a" : "#111" }}>
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

        {/* TikTok / Instagram / X セクション */}
        {platforms.map((platform) => {
          const platformRows = rows.filter((r) => r.platform === platform);
          const { label, color } = PLATFORM_LABEL[platform];
          const totalClicks = platformRows.reduce((s, r) => s + r.clicks, 0);
          const totalVerified = platformRows.reduce((s, r) => s + r.verified, 0);
          const totalCvr = totalClicks > 0 ? Math.round(totalVerified / totalClicks * 1000) / 10 : 0;
          const isAdding = addingFor === platform;

          return (
            <section key={platform} style={{ marginBottom: "56px" }}>
              {/* プラットフォームヘッダー */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color, margin: 0 }}>{label}</h2>
                <div style={{ display: "flex", gap: "16px", marginLeft: "auto" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>合計クリック <strong style={{ color: "#111" }}>{totalClicks}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>フォロー確認 <strong style={{ color: "#111" }}>{totalVerified}</strong></span>
                  <span style={{ fontSize: "12px", color: "#555" }}>CVR <strong style={{ color }}>{totalCvr}%</strong></span>
                </div>
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                {/* ソーシャル投稿 カード */}
                <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isAdding ? "16px" : 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "1px", margin: 0 }}>
                      ソーシャル投稿
                    </p>
                    <button
                      onClick={() => isAdding ? setAddingFor(null) : openAdd(platform)}
                      style={{
                        fontSize: "12px", color: isAdding ? "#888" : color,
                        background: "none", border: `1px solid ${isAdding ? "#ddd" : color}`,
                        padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600",
                      }}
                    >
                      {isAdding ? "キャンセル" : "+ チャネルを追加"}
                    </button>
                  </div>

                  {isAdding && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        value={newId}
                        onChange={e => setNewId(e.target.value)}
                        placeholder="チャネルID（例: tiktok-ad-001）"
                        style={{ flex: "1 1 180px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", outline: "none" }}
                      />
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="経路名（例: TikTok広告A）"
                        style={{ flex: "1 1 160px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", outline: "none" }}
                      />
                      <button
                        onClick={() => handleAdd(platform)}
                        disabled={saving || !newId.trim() || !newName.trim()}
                        style={{
                          padding: "8px 20px", background: color, color: "#fff",
                          border: "none", borderRadius: "6px", fontSize: "13px",
                          fontWeight: "700", cursor: "pointer", opacity: saving ? 0.6 : 1,
                        }}
                      >
                        {saving ? "追加中..." : "追加"}
                      </button>
                    </div>
                  )}
                </div>

                {/* トラッカー カード */}
                <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 0" }}>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#888", letterSpacing: "1px", margin: "0 0 12px" }}>
                      トラッカー
                    </p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <th style={th}>チャネルID</th>
                        <th style={th}>経路</th>
                        <th style={{ ...th, textAlign: "right" }}>クリック</th>
                        <th style={{ ...th, textAlign: "right" }}>フォロー確認</th>
                        <th style={{ ...th, textAlign: "right" }}>CVR</th>
                        <th style={{ ...th, textAlign: "center" }}>URL / QR</th>
                        <th style={{ ...th, textAlign: "center" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ ...td, textAlign: "center", color: "#aaa", padding: "24px" }}>
                            チャネルなし — 「ソーシャル投稿」から追加してください
                          </td>
                        </tr>
                      ) : (
                        platformRows.map((r) => (
                          <tr key={r.channel_id} style={{ borderBottom: "1px solid #f8f8f8" }}>
                            <td style={{ ...td, color: "#888", fontSize: "12px", fontFamily: "monospace" }}>{r.channel_id}</td>
                            <td style={td}>{r.channel_name}</td>
                            <td style={{ ...td, textAlign: "right" }}>{r.clicks}</td>
                            <td style={{ ...td, textAlign: "right" }}>{r.verified}</td>
                            <td style={{ ...td, textAlign: "right", fontWeight: "bold", color: r.cvr >= 30 ? "#16a34a" : "#111" }}>
                              {r.cvr}%
                            </td>
                            <td style={{ ...td, textAlign: "center" }}>
                              <QRCell channelId={r.channel_id} color={color} />
                            </td>
                            <td style={{ ...td, textAlign: "center" }}>
                              <button
                                onClick={() => handleDelete(r.channel_id)}
                                style={{ fontSize: "11px", color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
  color: "#888",
  fontSize: "12px",
};

const td: React.CSSProperties = {
  padding: "12px",
  color: "#333",
};
