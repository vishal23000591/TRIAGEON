import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

export default function Predictions() {

  /* 🔹 ONE CLEAN SCROLL OBSERVER FOR EVERYTHING */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const predictions = [
    {
      title: "Anemia Prediction",
      desc: "Hemoglobin risk via image or lab report",
      route: "/predictions/anemia",
      icon: "🩸",
      gradient: "linear-gradient(135deg, #ff6b8b 0%, #ff8e53 100%)",
      features: ["Image Analysis", "Lab Report Scan", "Risk Stratification"]
    },
    {
      title: "Diabetes Risk",
      desc: "Blood sugar & symptom based risk assessment",
      route: "/predictions/diabetes",
      icon: "🍬",
      gradient: "linear-gradient(135deg, #4cd964 0%, #5ac8fa 100%)",
      features: ["HbA1c Analysis", "Symptom Tracking", "Risk Progression"]
    },
    {
      title: "Blood Pressure",
      desc: "Hypertension severity assessment & monitoring",
      route: "/predictions/bp",
      icon: "🩺",
      gradient: "linear-gradient(135deg, #ff9500 0%, #ff2d55 100%)",
      features: ["BP Trend Analysis", "Medication Impact", "Risk Classification"]
    },
    {
      title: "Heart Risk",
      desc: "Cardiac risk evaluation & preventive insights",
      route: "/predictions/heart",
      icon: "❤️",
      gradient: "linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)",
      features: ["ECG Pattern Analysis", "Symptom Correlation", "Emergency Guidance"]
    },
    {
      title: "Fever / Infection",
      desc: "Infection severity prediction & treatment guidance",
      route: "/predictions/fever",
      icon: "🤒",
      gradient: "linear-gradient(135deg, #5ac8fa 0%, #007aff 100%)",
      features: ["Symptom Severity", "Infection Type", "Treatment Priority"]
    },
    {
      title: "Respiratory Health",
      desc: "Lung function & respiratory risk assessment",
      route: "/predictions/respiratory",
      icon: "🌬️",
      gradient: "linear-gradient(135deg, #34c759 0%, #32d74b 100%)",
      features: ["Breath Analysis", "Oxygen Levels", "Risk Categorization"]
    }
  ];

  return (
    <div className="page predictions-page">

      {/* HEADER */}
      <section className="hero-section">
        <h1 className="hero-title">AI-Powered Health Risk Predictions</h1>
        <p className="hero-subtitle">
          Advanced machine learning models analyze symptoms, vitals, and medical data
          to provide early risk detection and actionable insights.
        </p>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Prediction Accuracy</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Monitoring</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Cases Analyzed</div>
          </div>
        </div>
      </section>

      {/* PREDICTION CARDS */}
      <section className="section scroll-animate">
        <div className="section-header">
          <h2>Available Predictions</h2>
          <div className="accent-line"></div>
          <p className="section-subtitle">
            Choose a health concern to receive AI-powered risk assessment
          </p>
        </div>

        <div className="predictions-container">
          <div className="card-grid">
            {predictions.map((p, index) => (
              <EnhancedPredictionCard key={p.title} {...p} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="process-section scroll-animate">
        <h3>How Our Predictions Work</h3>
        <div className="process-steps">
          {[
            ["Data Input", "Upload reports or enter symptoms"],
            ["AI Analysis", "Patterns and correlations are analyzed"],
            ["Risk Assessment", "Urgency and severity are classified"],
            ["Next Steps", "Personalized recommendations provided"],
          ].map(([title, desc], i) => (
            <div className="process-step" key={i}>
              <div className="step-number">{i + 1}</div>
              <div className="step-content">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAFETY */}
      <section className="safety-section scroll-animate">
        <div className="safety-header">
          <h3>Important Safety Information</h3>
          <div className="safety-icon">⚠️</div>
        </div>

        <p className="safety-text">
          These AI predictions support — not replace — professional medical advice.
          Always consult a qualified healthcare provider for diagnosis and treatment.
          Seek immediate care during emergencies.
        </p>

        <div className="safety-footnote">
          <span>• Clinical Decision Support</span>
          <span>• HIPAA Compliant</span>
          <span>• Regulatory Review Ongoing</span>
        </div>
      </section>

    </div>
  );
}

/* ---------- CARD COMPONENT ---------- */
const EnhancedPredictionCard = ({
  title,
  desc,
  route,
  icon,
  gradient,
  features,
  index,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="prediction-card-enhanced scroll-animate"
      onClick={() => navigate(route)}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="card-background" style={{ background: gradient }} />

      <div className="icon-container">
        <div className="icon-circle" style={{ background: gradient }}>
          <span className="icon">{icon}</span>
        </div>
      </div>

      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-desc">{desc}</p>

        <div className="card-features">
          {features.map((f, i) => (
            <div className="feature-tag" key={i}>
              <span className="feature-check">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="card-action">
        <button className="card-btn">
          Analyze Now <span className="btn-arrow">→</span>
        </button>
      </div>

      <div className="card-glow" />
    </div>
  );
};
