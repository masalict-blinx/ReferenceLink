export default function TermsOfService() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px", fontFamily: "sans-serif", lineHeight: 1.8, color: "#333" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Last updated: March 6, 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>1. Acceptance of Terms</h2>
        <p>
          By accessing or using follower-tracker ("the Service"), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>2. Description of Service</h2>
        <p>
          follower-tracker is a social media follower verification platform that allows businesses to verify
          that users have followed their accounts on platforms such as TikTok, X (Twitter), and Instagram.
          The Service generates unique verification codes and tracks follow confirmation through platform APIs
          and webhooks.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>3. Eligibility</h2>
        <p>
          You must be at least 13 years of age to use this Service. By using the Service, you represent
          that you meet this requirement.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>4. User Conduct</h2>
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Use fake or automated accounts to complete verifications</li>
          <li>Attempt to manipulate or game the verification system</li>
          <li>Use the Service for any unlawful purpose</li>
          <li>Interfere with or disrupt the integrity of the Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>5. Third-Party Platforms</h2>
        <p>
          The Service integrates with third-party social media platforms including TikTok, X (Twitter), and
          Instagram. Your use of those platforms is governed by their respective terms of service. We are not
          responsible for changes to third-party platform APIs or policies that may affect the Service.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>6. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" without warranties of any kind. We do not guarantee that the
          Service will be uninterrupted, error-free, or that verification results will be 100% accurate.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
          special, or consequential damages arising out of your use of the Service.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>8. Changes to Terms</h2>
        <p>
          We reserve the right to update these Terms at any time. Continued use of the Service after
          changes constitutes acceptance of the new Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>9. Contact</h2>
        <p>
          For questions about these Terms, contact us at:{" "}
          <a href="mailto:marketing@blinx.jp" style={{ color: "#0066cc" }}>marketing@blinx.jp</a>
        </p>
      </section>
    </main>
  );
}
