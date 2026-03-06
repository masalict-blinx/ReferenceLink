"use client";

import { useState } from "react";

export default function QRCell({ channelId, color }: { channelId: string; color: string }) {
  const [open, setOpen] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const qrUrl = `${apiUrl}/channels/${channelId}/qr`;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <a
          href={`${appUrl}/track/${channelId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "11px", color: "#555", textDecoration: "none", border: "1px solid #222", padding: "4px 8px", borderRadius: "4px" }}
        >
          URL
        </a>
        <button
          onClick={() => setOpen(!open)}
          style={{ fontSize: "11px", color, background: "none", border: `1px solid ${color}`, padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}
        >
          {open ? "QR ▲" : "QR ▼"}
        </button>
      </div>

      {open && (
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
            style={{ fontSize: "11px", color: "#888", textDecoration: "none", border: "1px solid #333", padding: "4px 10px", borderRadius: "4px" }}
          >
            ダウンロード
          </a>
        </div>
      )}
    </div>
  );
}
