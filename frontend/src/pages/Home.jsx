import React from "react";

export default function Home() {
  return (
    <div className="page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">
          Smarter Medical Triage for Early Care Decisions
        </h1>

        <p className="hero-subtitle">
          TRIAGEON is an AI-assisted medical triage platform that helps identify
          potential health risks early, explains urgency clearly, and guides
          patients to the right level of care — before complications arise.
        </p>

        <div className="hero-actions">
          <button className="primary-btn">See How It Works</button>
          <button className="secondary-btn">For Healthcare Providers</button>
        </div>
      </section>

      {/* WHY TRIAGEON */}
      <section className="section">
        <div className="section-header">
          <h2>Why TRIAGEON?</h2>
          <div className="accent-line"></div>
        </div>

        <div className="content-card">
          <p className="lead-text">
            In many healthcare settings, non-urgent cases overwhelm clinics while
            serious conditions such as anemia, uncontrolled diabetes, hypertension,
            cardiac risks, or infections often go unnoticed until they become severe.
          </p>

          <p>
            TRIAGEON bridges this gap by analyzing symptoms, vitals, and medical
            reports to provide early risk insights and urgency guidance — helping
            both patients and clinics make informed decisions faster.
          </p>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="section">
        <div className="section-header">
          <h2>What TRIAGEON Helps With</h2>
          <div className="accent-line"></div>
        </div>

        <div className="features-grid">
          <Feature
            title="Early Risk Detection"
            text="Identifies potential health risks using symptoms, vitals, and lab information before conditions worsen."
            icon="🔍"
          />
          <Feature
            title="Clear Urgency Classification"
            text="Translates complex medical signals into understandable urgency levels such as emergency, urgent, or monitor."
            icon="⚠️"
          />
          <Feature
            title="Explainable Insights"
            text="Provides simple explanations highlighting abnormal values and contributing factors behind each risk."
            icon="💡"
          />
          <Feature
            title="Care Navigation"
            text="Guides high-risk patients toward appropriate clinics or specialists for timely medical attention."
            icon="📍"
          />
          <Feature
            title="Continuous Monitoring"
            text="Tracks symptom progression and vital changes to update risk assessments over time."
            icon="📈"
          />
          <Feature
            title="Clinical Workflow Integration"
            text="Seamlessly fits into existing healthcare systems with easy-to-use interfaces for staff."
            icon="⚙️"
          />
        </div>
      </section>

      {/* SAFETY & DISCLAIMER */}
      <section className="safety-section">
        <div className="safety-header">
          <h3>Designed for Safety & Responsible Use</h3>
          <div className="safety-icon">🛡️</div>
        </div>

        <p className="safety-text">
          TRIAGEON is an early risk detection and triage support system. It does
          not provide final medical diagnoses or replace professional medical
          judgment. All recommendations are intended to support timely care
          decisions and encourage appropriate medical consultation.
        </p>

        <div className="safety-footnote">
          <span className="footnote-item">• HIPAA Compliant</span>
          <span className="footnote-item">• Clinical Validation Ongoing</span>
          <span className="footnote-item">• CE Mark Pending</span>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <h3>Ready to experience smarter triage?</h3>
        <p>Join hospitals and clinics already using TRIAGEON to improve patient outcomes.</p>
        <button className="primary-btn large-btn">Get Started Today</button>
      </section>
    </div>
  );
}

/* ---------- FEATURE CARD COMPONENT ---------- */
function Feature({ title, text, icon }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}