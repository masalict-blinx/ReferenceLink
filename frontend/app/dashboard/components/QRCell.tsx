"use client";

import { useState } from "react";

export default function QRCell({ channelId, color, urlOverride, qrUrlOverride }: { channelId: string; color: string; urlOverride?: string; qrUrlOverride?: string }) {
  const [showUrl, setShowUrl] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const trackUrl = urlOverride ?? `/track/${channelId}`;
  const qrUrl = qrUrlOverride ?? `/api/channels/${channelId}/qr`;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button
          onClick={() => setShowUrl(!showUrl)}
          style={{ fontSize: "11px", color: "#555", background: "none", border: "1px solid #ccc", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
        >
          {showUrl ? "URL ▲" : "URL ▼"}
        </button>
        <button
          onClick={() => setShowQr(!showQr)}
          style={{ fontSize: "11px", color, background: "none", border: `1px solid ${color}`, padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
        >
          {showQr ? "QR ▲" : "QR ▼"}
        </button>
      </div>

      {showUrl && (
        <div style={{ marginTop: "8px", padding: "8px", background: "#f5f5f5", borderRadius: "4px", wordBreak: "break-all" }}>
          <span style={{ fontSize: "11px", color: "#555", fontFamily: "monospace" }}>{trackUrl}</span>
        </div>
      )}

      {showQr && (
        <div style={{ marginTop: "12px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`QR ${channelId}`}
            style={{ width: "120px", height: "120px", display: "block", margin: "0 auto 8px", borderRadius: "8px" }}
          />
          <a
            href={qrUrl}
            download={`qr-${channelId}.png`}
            style={{ fontSize: "11px", color: "#555", textDecoration: "none", border: "1px solid #ccc", padding: "4px 10px", borderRadius: "4px" }}
          >
            ダウンロード
          </a>
        </div>
      )}
    </div>
  );
}
