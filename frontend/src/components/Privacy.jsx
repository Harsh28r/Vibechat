import './Privacy.css'

function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>Camify Privacy Policy</h1>
          <p>Last updated: November 9, 2025</p>
          <p>
            At Camify, we connect people through instant random video chats while prioritizing safety,
            privacy, and transparency. This policy explains what data we collect, why we collect it, and
            how you can control your personal information.
          </p>
        </header>

        <section className="privacy-section">
          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Account details:</strong> Email, username, and profile information required to create and manage your account.
            </li>
            <li>
              <strong>Usage data:</strong> Session activity, device information, and connection logs used to improve service stability and prevent abuse.
            </li>
            <li>
              <strong>Optional preferences:</strong> Interests, country filters, and gender preferences to personalize your match experience.
            </li>
            <li>
              <strong>Moderation data:</strong> Reports, ban history, and moderation decisions that help keep the community safe.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Match you with compatible partners and maintain call quality.</li>
            <li>Detect fraudulent activity and enforce our community guidelines.</li>
            <li>Analyze performance trends to improve features and reliability.</li>
            <li>Communicate important service updates, policy changes, or account-related alerts.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Sharing & Disclosure</h2>
          <p>
            We do not sell your data. We only share information in limited situations:
          </p>
          <ul>
            <li>
              <strong>Service providers:</strong> Trusted vendors (e.g., hosting, analytics, authentication)
              that process data on our behalf under strict confidentiality agreements.
            </li>
            <li>
              <strong>Legal requirements:</strong> When required by law or to protect the rights, safety,
              or property of Camify, our users, or the public.
            </li>
            <li>
              <strong>Consent:</strong> With your explicit permission for specific features or integrations.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to provide the service, comply with legal obligations,
            and resolve disputes. You may request deletion of your account data at any time by contacting support.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Your Rights & Choices</h2>
          <ul>
            <li>Access, update, or delete your account information.</li>
            <li>Adjust privacy settings such as interests, country filters, and camera/microphone access.</li>
            <li>Opt out of marketing communications from your account dashboard or email footer links.</li>
            <li>Request a copy of the data we hold about you by contacting privacy@camify.fun.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Security Measures</h2>
          <p>
            We use industry-standard encryption, secure infrastructure, and manual moderation reviews to protect your data
            and keep the platform safe. Despite our efforts, no platform can guarantee 100% security, so please use Camify responsibly.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Children&apos;s Privacy</h2>
          <p>
            Camify is for users aged 18 and above. We do not knowingly collect data from children. If you believe someone under 18 is using the platform,
            contact us immediately so we can take appropriate action.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. International Transfers</h2>
          <p>
            Camify may process and store data in multiple countries. We ensure adequate safeguards are in place when transferring data internationally,
            consistent with applicable privacy laws.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Updates to This Policy</h2>
          <p>
            We periodically update our Privacy Policy to reflect new features, legal requirements, or security practices.
            Significant changes will be communicated through the app or email. Continued use of Camify after updates indicates acceptance.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Contact Us</h2>
          <p>
            Questions or concerns? Reach out to our privacy team:
          </p>
          <ul className="contact-list">
            <li>Email: <a href="mailto:privacy@camify.fun">privacy@camify.fun</a></li>
            <li>Support: <a href="https://www.camify.fun/support">https://www.camify.fun/support</a></li>
          </ul>
        </section>

        <footer className="privacy-footer">
          <p>Camify, Inc. © {new Date().getFullYear()}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default Privacy

