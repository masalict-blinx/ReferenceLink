export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif", lineHeight: 1.8, color: "#333" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Last updated: March 6, 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>1. Introduction</h2>
        <p>
          follower-tracker ("we", "our", or "us") operates a social media follower verification service.
          This Privacy Policy explains how we collect, use, and protect information when you use our service.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>2. Information We Collect</h2>
        <p>We collect the following information when you use our service:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Your social media platform username or user ID (TikTok, X/Twitter, Instagram)</li>
          <li>Verification codes generated during the follower verification process</li>
          <li>Timestamps of follow and verification actions</li>
          <li>Platform-specific public data necessary for verification (e.g., public post content, comment text)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>3. How We Use Your Information</h2>
        <p>We use the collected information solely to:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Verify that you have followed an account on a supported social media platform</li>
          <li>Track verification session status</li>
          <li>Provide campaign analytics to account administrators</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>4. TikTok Data Usage</h2>
        <p>
          When you participate in a TikTok follower verification campaign, we access your TikTok public comment
          data to detect verification codes. We do not store your full TikTok profile or any private data.
          Data obtained through TikTok APIs is used exclusively for verification purposes and is not shared
          with third parties.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>5. Data Retention</h2>
        <p>
          Verification session data is retained for a maximum of 90 days after the campaign ends.
          After this period, all personally identifiable information is deleted.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>6. Data Sharing</h2>
        <p>
          We do not sell, trade, or share your personal information with third parties, except as required
          by law or to operate the service (e.g., hosting providers).
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Request deletion of your verification data</li>
          <li>Request a copy of the data we hold about you</li>
          <li>Opt out of future data collection by not participating in campaigns</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>8. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:{" "}
          <a href="mailto:marketing@blinx.jp" style={{ color: "#0066cc" }}>marketing@blinx.jp</a>
        </p>
      </section>
    </main>
  );
}
