import React, { useState } from "react";
import { predictBP } from "../../services/prediction.service";

/**
 * @typedef {"Normal" | "Elevated" | "Stage 1" | "Stage 2" | "Hypertensive Crisis" | "Unknown"} BPSeverity
 */

/**
 * @typedef {Object} BPPredictionResult
 * @property {"hypertension"} disease
 * @property {BPSeverity} severity
 * @property {number | null} risk_probability
 * @property {number} confidence
 */

/**
 * Determine BP Category based on systolic and diastolic readings
 */
const getBPCategory = (systolic, diastolic) => {
  const sys = Number(systolic);
  const dia = Number(diastolic);
  
  if (sys < 120 && dia < 80) return "Normal Blood Pressure";
  if (sys < 130 && dia < 80) return "Elevated Blood Pressure";
  if (sys < 140 || dia < 90) return "Stage 1 Hypertension";
  if (sys < 180 || dia < 120) return "Stage 2 Hypertension";
  if (sys >= 180 || dia >= 120) return "Hypertensive Crisis";
  return "Blood Pressure Assessment";
};

/**
 * Determine hypertension triage priority based on BP levels
 */
const getHypertensionTriagePriority = (systolic, diastolic) => {
  const sys = Number(systolic);
  const dia = Number(diastolic);
  
  // Hypertensive Emergency (Resuscitation)
  if (sys >= 180 && dia >= 120) return "Resuscitation";
  if (sys >= 220 || dia >= 140) return "Resuscitation";
  
  // Hypertensive Urgency (Emergent)
  if (sys >= 180 || dia >= 110) return "Emergent";
  if (sys >= 160 && dia >= 100) return "Emergent";
  
  // Stage 2 Hypertension (Urgent)
  if (sys >= 140 || dia >= 90) return "Urgent";
  
  // Stage 1 Hypertension (Less Urgent)
  if (sys >= 130 || dia >= 80) return "Less Urgent";
  
  // Normal/Elevated (Non-Urgent)
  return "Non-Urgent";
};

/**
 * Get hypertension-specific triage details
 */
const getHypertensionTriageDetails = (priority) => {
  const triageMap = {
    "Resuscitation": {
      color: "#ff0000",
      bgColor: "#ffebee",
      borderColor: "#ff0000",
      icon: "⚕️",
      responseTime: "IMMEDIATE",
      description: "Hypertensive Emergency - Organ Damage Risk",
      warning: "🚨 Hypertensive Crisis - Risk of Stroke/Heart Attack"
    },
    "Emergent": {
      color: "#ff5722",
      bgColor: "#fff3e0",
      borderColor: "#ff5722",
      icon: "🚨",
      responseTime: "< 15 minutes",
      description: "Severe Hypertension - Requires Rapid Reduction",
      warning: "⚠️ Hypertensive Urgency - Medical Attention Needed"
    },
    "Urgent": {
      color: "#ff9800",
      bgColor: "#fff8e1",
      borderColor: "#ff9800",
      icon: "⚠️",
      responseTime: "< 60 minutes",
      description: "Stage 2 Hypertension - Needs Treatment",
      warning: "🩺 Uncontrolled Hypertension - Medical Evaluation"
    },
    "Less Urgent": {
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      icon: "👨‍⚕️",
      responseTime: "24-48 hours",
      description: "Stage 1 Hypertension - Lifestyle Intervention",
      warning: "📋 Needs BP Monitoring & Management Plan"
    },
    "Non-Urgent": {
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      icon: "✅",
      responseTime: "Primary Care Follow-up",
      description: "Normal/Elevated BP - Preventive Care",
      warning: "💙 Routine Cardiovascular Screening"
    }
  };
  
  return triageMap[priority] || triageMap["Urgent"];
};

/**
 * Get hypertension-specific clinical pathway
 */
const getHypertensionPathway = (priority) => {
  const pathways = {
    "Resuscitation": {
      actions: [
        "🚑 CALL 911/112 IMMEDIATELY",
        "💊 Do NOT take extra BP medication",
        "🛌 Lie down in quiet environment",
        "📱 Notify emergency cardiac team"
      ],
      facility: "Emergency Department - Cardiac ICU",
      transport: "Advanced Life Support Ambulance",
      team: "Cardiologist + Critical Care Team",
      tests: ["ECG", "Troponin", "Head CT", "Renal Function", "Fundoscopy"],
      medication: "IV Antihypertensives (Labetalol, Nitroprusside)",
      monitoring: "Continuous arterial line, Neurological checks"
    },
    "Emergent": {
      actions: [
        "🏥 Go to Emergency Department NOW",
        "💊 Take prescribed BP medications",
        "📱 Call cardiology on-call service",
        "📋 Bring all medications and history"
      ],
      facility: "Emergency Department - Observation Unit",
      transport: "Ambulance or private vehicle with companion",
      team: "Emergency Physician + Cardiology Consult",
      tests: ["ECG", "Cardiac Enzymes", "Renal Panel", "Chest X-ray"],
      medication: "Oral/IV Antihypertensives",
      monitoring: "Frequent BP checks, Cardiac monitoring"
    },
    "Urgent": {
      actions: [
        "🏥 Visit Urgent Care or Cardiology Clinic",
        "📅 Schedule same-day cardiology consult",
        "🩺 Check BP every 30 minutes",
        "💊 Review current medication regimen"
      ],
      facility: "Cardiology Clinic or Hospital OPD",
      transport: "Private vehicle",
      team: "Cardiologist or Hypertension Specialist",
      tests: ["24-hour Ambulatory BP", "Echocardiogram", "Renal Ultrasound", "Aldosterone/Renin"],
      medication: "Initiate/Adjust Antihypertensive Therapy",
      monitoring: "Home BP monitoring twice daily"
    },
    "Less Urgent": {
      actions: [
        "👨‍⚕️ Schedule cardiology appointment within 48 hours",
        "📱 Telehealth hypertension consultation",
        "📝 Start BP log (morning/evening readings)",
        "🥗 Begin DASH diet and sodium restriction"
      ],
      facility: "Primary Care or Cardiology Clinic",
      transport: "Private vehicle",
      team: "Primary Care Physician or Cardiologist",
      tests: ["Basic Metabolic Panel", "Lipid Profile", "Urinalysis", "ECG"],
      medication: "Consider starting first-line therapy",
      monitoring: "Weekly BP monitoring"
    },
    "Non-Urgent": {
      actions: [
        "📅 Schedule routine cardiovascular check-up",
        "🏠 Continue healthy lifestyle practices",
        "📱 Annual BP screening",
        "💙 Maintain regular exercise and diet"
      ],
      facility: "Primary Care Clinic",
      transport: "Not urgent - schedule appointment",
      team: "Primary Care Physician",
      tests: ["Annual BP check", "Annual Labs", "BMI assessment"],
      medication: "None or current regimen if controlled",
      monitoring: "Annual BP screening"
    }
  };
  
  return pathways[priority] || pathways["Urgent"];
};

/**
 * Get BP level description
 */
const getBPLevelDescription = (severity) => {
  const descriptions = {
    "Normal": "Healthy blood pressure range. Continue maintaining a healthy lifestyle.",
    "Elevated": "Slightly elevated. Consider lifestyle modifications and regular monitoring.",
    "Stage 1": "Stage 1 hypertension. Medical consultation and lifestyle changes recommended.",
    "Stage 2": "Stage 2 hypertension. Urgent medical attention and treatment required.",
    "Hypertensive Crisis": "Medical emergency! Seek immediate medical attention.",
    "Unknown": "Please consult with a healthcare professional for accurate assessment."
  };
  return descriptions[severity] || descriptions["Unknown"];
};

/**
 * Get recommendations based on BP level
 */
const getBPRecommendations = (severity) => {
  const recommendations = {
    "Normal": [
      "Continue regular exercise",
      "Maintain healthy diet",
      "Annual check-ups"
    ],
    "Elevated": [
      "Reduce sodium intake",
      "Increase physical activity",
      "Monitor weekly",
      "Limit alcohol"
    ],
    "Stage 1": [
      "Consult physician",
      "Start medication if prescribed",
      "Daily monitoring",
      "Stress management"
    ],
    "Stage 2": [
      "Immediate medical consultation",
      "Regular medication",
      "Emergency contact ready",
      "Frequent monitoring"
    ],
    "Hypertensive Crisis": [
      "Call emergency services",
      "Do not delay treatment",
      "Rest in sitting position",
      "Seek hospital care"
    ]
  };
  return recommendations[severity] || ["Consult healthcare professional"];
};

export default function BPPrediction() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!systolic || !diastolic) {
      setError("Please enter both systolic and diastolic values");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await predictBP({
        systolic_bp: Number(systolic),
        diastolic_bp: Number(diastolic)
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate derived values
  const bpCategory = getBPCategory(systolic, diastolic);
  const triagePriority = getHypertensionTriagePriority(systolic, diastolic);
  const triageDetails = getHypertensionTriageDetails(triagePriority);
  const clinicalPathway = getHypertensionPathway(triagePriority);

  // Inline Styles
  const containerStyle = {
    maxWidth: "900px",
    margin: "3rem auto",
    padding: "2.5rem",
    background: "#f8fbff",
    borderRadius: "18px",
    border: "1px solid #e6eef8",
    boxShadow: "0 8px 24px rgba(77, 163, 255, 0.08)",
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    animation: "fadeUp 0.8s ease-out",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "2.5rem",
    position: "relative",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ff9500 0%, #ff2d55 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "0.75rem",
  };

  const subtitleStyle = {
    fontSize: "1.125rem",
    color: "#5f6c7b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.6",
  };

  const formContainerStyle = {
    background: "#ffffff",
    padding: "2.5rem",
    borderRadius: "14px",
    border: "1px solid #e6eef8",
    boxShadow: "0 4px 16px rgba(77, 163, 255, 0.05)",
    marginBottom: "2rem",
  };

  const inputGroupStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "2rem",
  };

  const inputWrapperStyle = {
    position: "relative",
  };

  const inputLabelStyle = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "0.5rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "1rem 1.25rem",
    fontSize: "1.125rem",
    borderRadius: "12px",
    border: "2px solid #e6eef8",
    background: "#ffffff",
    color: "#1a1a1a",
    transition: "all 0.3s ease",
    outline: "none",
    textAlign: "center",
    fontWeight: "600",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #ff9500 0%, #ff2d55 100%)",
    color: "white",
    padding: "1rem 2.5rem",
    fontSize: "1.0625rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(255, 149, 0, 0.15)",
    position: "relative",
    overflow: "hidden",
    display: "block",
    margin: "0 auto",
  };

  const loadingButtonStyle = {
    ...buttonStyle,
    opacity: "0.7",
    cursor: "not-allowed",
  };

  const resultCardStyle = {
    background: "#ffffff",
    marginTop: "2rem",
    padding: "2.5rem",
    borderRadius: "14px",
    border: "1px solid #e6eef8",
    boxShadow: "0 8px 24px rgba(77, 163, 255, 0.08)",
    animation: "fadeIn 0.6s ease-out",
    position: "relative",
    overflow: "hidden",
  };

  const resultHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #e6eef8",
  };

  const resultIconStyle = {
    fontSize: "2.5rem",
  };

  const resultTitleStyle = {
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0",
  };

  const bpReadingStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "linear-gradient(135deg, #f2f8ff 0%, #e6f2ff 100%)",
    borderRadius: "12px",
    border: "2px solid #d1e0ff",
  };

  const bpValueStyle = {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
  };

  const bpSeparatorStyle = {
    fontSize: "2rem",
    color: "#5f6c7b",
    margin: "0 0.5rem",
  };

  const resultGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  };

  const resultItemStyle = {
    background: "#f2f8ff",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #e6eef8",
    transition: "all 0.3s ease",
  };

  const resultLabelStyle = {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#5f6c7b",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const resultValueStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1a1a1a",
  };

  // TRIAGE CARD STYLES
  const triageCardStyle = {
    background: triageDetails.bgColor,
    border: `3px solid ${triageDetails.borderColor}`,
    borderRadius: "14px",
    padding: "1.5rem",
    margin: "2rem 0",
    animation: "bpPulse 2s infinite",
  };

  const triageHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  };

  const triageIconStyle = {
    fontSize: "2.5rem",
  };

  const triageTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: triageDetails.color,
    margin: "0",
    flexGrow: "1",
  };

  const triageBadgeStyle = {
    background: triageDetails.color,
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "600",
    letterSpacing: "0.5px",
  };

  const triageGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginTop: "1.5rem",
  };

  const triageItemStyle = {
    background: "rgba(255, 255, 255, 0.7)",
    padding: "1.25rem",
    borderRadius: "10px",
    border: `1px solid ${triageDetails.borderColor}`,
  };

  const clinicalPathwayStyle = {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "#f9f9ff",
    borderRadius: "12px",
    border: "2px solid #e6eef8",
  };

  const pathwayGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginTop: "1.5rem",
  };

  const pathwayItemStyle = {
    background: "#ffffff",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #e6eef8",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const bpCategoryStyle = {
    background: "linear-gradient(135deg, #ff9500 0%, #ff2d55 100%)",
    color: "white",
    padding: "1.25rem 1.75rem",
    borderRadius: "12px",
    fontSize: "1.125rem",
    fontWeight: "600",
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    animation: "bpPulse 2s infinite ease-in-out",
  };

  const recommendationsStyle = {
    marginTop: "1.5rem",
    padding: "1.5rem",
    background: "#f2f8ff",
    borderRadius: "10px",
    border: "1px solid #d1e0ff",
  };

  const recommendationListStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "0.75rem",
    marginTop: "1rem",
  };

  const recommendationItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    background: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e6eef8",
    fontSize: "0.9375rem",
    color: "#2d3748",
    transition: "all 0.3s ease",
  };

  const errorStyle = {
    background: "linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "500",
    marginTop: "1.5rem",
    textAlign: "center",
    animation: "shake 0.5s ease-in-out",
  };

  // Severity colors mapping
  const severityColors = {
    "Normal": "#4cd964",
    "Elevated": "#ff9500",
    "Stage 1": "#ff3b30",
    "Stage 2": "#ff2d55",
    "Hypertensive Crisis": "#ff0000",
    "Unknown": "#5f6c7b"
  };

  // BP classification function
  const getBPClassification = (sys, dia) => {
    if (sys < 120 && dia < 80) return { class: "Normal", color: "#4cd964" };
    if (sys < 130 && dia < 80) return { class: "Elevated", color: "#ff9500" };
    if (sys < 140 && dia < 90) return { class: "Stage 1", color: "#ff3b30" };
    if (sys < 180 && dia < 120) return { class: "Stage 2", color: "#ff2d55" };
    return { class: "Crisis", color: "#ff0000" };
  };

  const bpClassification = getBPClassification(Number(systolic), Number(diastolic));

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Hypertension Triage & Risk Assessment</h1>
        <p style={subtitleStyle}>
          Enter systolic and diastolic readings for AI-powered hypertension triage, 
          cardiovascular emergency assessment, and clinical pathway recommendations
        </p>
      </div>

      <div style={formContainerStyle}>
        <div style={inputGroupStyle}>
          <div style={inputWrapperStyle}>
            <label style={inputLabelStyle}>
              Systolic Pressure (mmHg)
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                style={inputStyle}
                placeholder="Enter the value"
                min="50"
                max="300"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#ff9500";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255, 149, 0, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e6eef8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <div style={{ fontSize: "0.75rem", color: "#5f6c7b", marginTop: "0.5rem" }}>
              Top number - pressure when heart beats
            </div>
          </div>

          <div style={inputWrapperStyle}>
            <label style={inputLabelStyle}>
              Diastolic Pressure (mmHg)
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                style={inputStyle}
                placeholder="Enter the value"
                min="30"
                max="200"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#ff2d55";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255, 45, 85, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e6eef8";
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>
            <div style={{ fontSize: "0.75rem", color: "#5f6c7b", marginTop: "0.5rem" }}>
              Bottom number - pressure between beats
            </div>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading || !systolic || !diastolic}
          style={loading || !systolic || !diastolic ? loadingButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!loading && systolic && diastolic) {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 149, 0, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && systolic && diastolic) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 149, 0, 0.15)";
            }
          }}
          onMouseDown={(e) => {
            if (!loading && systolic && diastolic) {
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseUp={(e) => {
            if (!loading && systolic && diastolic) {
              e.currentTarget.style.transform = "translateY(-3px)";
            }
          }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: "0.5rem" }}>⏳</span>
              Running Hypertension Triage...
            </>
          ) : (
            <>
              <span style={{ marginRight: "0.5rem" }}>⚕️</span>
              Assess & Determine BP Priority
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={resultCardStyle}>
          <div style={resultHeaderStyle}>
            <div style={resultIconStyle}>🩺</div>
            <h3 style={resultTitleStyle}>Hypertension Triage & Assessment Results</h3>
          </div>

          {/* BP Reading Display */}
          <div style={bpReadingStyle}>
            <div style={{ textAlign: "center" }}>
              <div style={resultLabelStyle}>Systolic</div>
              <div style={{ ...bpValueStyle, color: bpClassification.color }}>{systolic}</div>
              <div style={{ fontSize: "0.75rem", color: bpClassification.color, marginTop: "4px" }}>
                {bpClassification.class}
              </div>
            </div>
            <div style={bpSeparatorStyle}>/</div>
            <div style={{ textAlign: "center" }}>
              <div style={resultLabelStyle}>Diastolic</div>
              <div style={{ ...bpValueStyle, color: bpClassification.color }}>{diastolic}</div>
              <div style={{ fontSize: "0.75rem", color: bpClassification.color, marginTop: "4px" }}>
                {bpClassification.class}
              </div>
            </div>
          </div>

          <div style={resultGridStyle}>
            {[
              { 
                label: "Severity Level", 
                value: result.severity,
                icon: "⚠️",
                style: { color: severityColors[result.severity] || "#5f6c7b" }
              },
              { 
                label: "Hypertension Risk", 
                value: `${(parseFloat(result.risk_probability) * 100).toFixed(1)}%`,
                icon: "📈",
                style: { 
                  color: result.risk_probability >= 0.8 ? "#ff0000" : 
                         result.risk_probability >= 0.6 ? "#ff2d55" :
                         result.risk_probability >= 0.4 ? "#ff9500" : "#4cd964" 
                }
              },
              { 
                label: "AI Confidence", 
                value: `${(parseFloat(result.confidence) * 100).toFixed(1)}%`,
                icon: "🎯"
              },
              { 
                label: "Cardiovascular Stability", 
                value: triagePriority === "Non-Urgent" || triagePriority === "Less Urgent" 
                  ? "Stable" 
                  : "Unstable - Requires Monitoring",
                icon: "❤️",
                style: { color: (triagePriority === "Non-Urgent" || triagePriority === "Less Urgent") ? "#4cd964" : "#ff3b30" }
              },
            ].map((item, index) => (
              <div 
                key={index} 
                style={resultItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 149, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                  <div style={resultLabelStyle}>{item.label}</div>
                </div>
                <div 
                  style={{ 
                    ...resultValueStyle, 
                    ...(item.style || {}),
                    fontSize: item.label === "Severity Level" ? "1.5rem" : "1.25rem"
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ========== HYPERTENSION TRIAGE SYSTEM ========== */}
          <div style={triageCardStyle}>
            <div style={triageHeaderStyle}>
              <div style={triageIconStyle}>{triageDetails.icon}</div>
              <h3 style={triageTitleStyle}>Cardiovascular Triage Priority</h3>
              <div style={triageBadgeStyle}>{triagePriority.toUpperCase()}</div>
            </div>

            <div style={{ 
              background: "rgba(255, 255, 255, 0.9)", 
              padding: "1rem", 
              borderRadius: "10px", 
              marginBottom: "1rem",
              borderLeft: `4px solid ${triageDetails.color}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🚨</span>
                <div>
                  <div style={{ fontWeight: "600", color: triageDetails.color }}>
                    {triageDetails.warning}
                  </div>
                  <div style={{ fontSize: "0.9375rem", color: "#2d3748", marginTop: "0.25rem" }}>
                    {triageDetails.description}
                  </div>
                </div>
              </div>
            </div>

            <div style={triageGridStyle}>
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Response Time Required</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color, fontSize: "1.5rem" }}>
                  {triageDetails.responseTime}
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>BP Classification</div>
                <div style={{ ...resultValueStyle, color: severityColors[result.severity] }}>
                  {result.severity}
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Clinical Priority</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color }}>
                  {triagePriority} Care
                </div>
              </div>
            </div>
          </div>

          {/* ========== HYPERTENSION CLINICAL PATHWAY ========== */}
          <div style={clinicalPathwayStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏥</span>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#2d3748", margin: "0" }}>
                Recommended Cardiovascular Care Pathway
              </h4>
            </div>

            <div style={pathwayGridStyle}>
              <div style={pathwayItemStyle}>
                <div style={resultLabelStyle}>Immediate Actions</div>
                <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>
                  {clinicalPathway.actions.map((action, idx) => (
                    <li key={idx} style={{ marginBottom: "0.5rem", fontSize: "0.9375rem", lineHeight: "1.5" }}>
                      {action}
                    </li>
                  ))}
                </ul>
                
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#e3f2fd", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#2196f3" }}>
                    💡 Critical Warning:
                  </div>
                  <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {triagePriority === "Resuscitation" ? 
                      "Do NOT take extra BP medication before medical evaluation" : 
                      "Do NOT stop prescribed medications without doctor's advice"}
                  </div>
                </div>
              </div>
              
              <div style={pathwayItemStyle}>
                <div style={resultLabelStyle}>Medical Facility</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem", marginBottom: "1rem" }}>
                  {clinicalPathway.facility}
                </div>
                
                <div style={resultLabelStyle}>Recommended Transport</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem", marginBottom: "1rem" }}>
                  {clinicalPathway.transport}
                </div>
                
                <div style={resultLabelStyle}>Care Team</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem", marginBottom: "1rem" }}>
                  {clinicalPathway.team}
                </div>
                
                <div style={resultLabelStyle}>Diagnostic Tests Needed</div>
                <div style={{ fontSize: "0.9375rem", marginTop: "0.5rem" }}>
                  {clinicalPathway.tests.map((test, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "#4cd964" }}>✓</span> {test}
                    </div>
                  ))}
                </div>
                
                <div style={{ ...resultLabelStyle, marginTop: "1rem" }}>Medication Protocol</div>
                <div style={{ fontSize: "0.9375rem", color: "#2d3748", marginTop: "0.25rem" }}>
                  {clinicalPathway.medication}
                </div>
              </div>
            </div>
          </div>

          {/* BP Category Analysis */}
          <div style={bpCategoryStyle}>
            <span style={{ fontSize: "1.75rem" }}>📊</span>
            <div>
              <div style={{ fontSize: "0.875rem", opacity: "0.9" }}>Blood Pressure Classification</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>{bpCategory}</div>
            </div>
          </div>

          {/* Hypertensive Crisis Warning */}
          {(triagePriority === "Resuscitation" || triagePriority === "Emergent") && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
              borderRadius: "10px",
              border: "2px solid #ff0000",
              animation: "emergencyFlash 1.5s infinite",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🚨</span>
                <div style={{ fontWeight: "700", color: "#ff0000", fontSize: "1.125rem" }}>
                  HYPERTENSIVE EMERGENCY WARNING
                </div>
              </div>
              <div style={{ fontSize: "0.9375rem", color: "#b71c1c" }}>
                If you experience ANY of these symptoms with high BP, call emergency services IMMEDIATELY:
              </div>
              <ul style={{ margin: "0.5rem 0 0 1.25rem", fontSize: "0.9375rem", color: "#b71c1c" }}>
                <li>Severe headache, blurred vision, or confusion</li>
                <li>Chest pain, palpitations, or shortness of breath</li>
                <li>Nausea, vomiting, or severe anxiety</li>
                <li>Seizures or loss of consciousness</li>
                <li>Severe nosebleed that won't stop</li>
              </ul>
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "white", borderRadius: "8px" }}>
                <div style={{ fontWeight: "600", color: "#ff0000", fontSize: "0.875rem" }}>
                  💊 Important Medication Note:
                </div>
                <div style={{ fontSize: "0.875rem", color: "#d32f2f", marginTop: "0.25rem" }}>
                  Do NOT take extra BP medication - wait for medical supervision
                </div>
              </div>
            </div>
          )}

          {/* BP Level Description */}
          <div style={{
            marginTop: "1rem",
            padding: "1.25rem",
            background: "#f8fbff",
            borderRadius: "10px",
            border: "1px solid #d1e0ff",
            color: "#5f6c7b",
            lineHeight: "1.6",
            fontSize: "0.9375rem",
          }}>
            <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "0.5rem" }}>
              📝 Clinical Assessment Summary
            </div>
            {getBPLevelDescription(result.severity)}
          </div>

          {/* Recommendations */}
          <div style={recommendationsStyle}>
            <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "1rem", fontSize: "1.125rem" }}>
              💡 Self-Care & Lifestyle Recommendations
            </div>
            <div style={recommendationListStyle}>
              {getBPRecommendations(result.severity).map((rec, idx) => (
                <div key={idx} style={recommendationItemStyle}>
                  <span style={{ color: "#4cd964" }}>✓</span>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#f2f8ff",
            borderRadius: "10px",
            border: "1px solid #d1e0ff",
            fontSize: "0.9375rem",
            color: "#5f6c7b",
            lineHeight: "1.6",
          }}>
            <div style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#2d3748" }}>
              ⚕️ Hypertension Emergency Protocol Disclaimer
            </div>
            This AI triage system is for informational purposes only and does not replace 
            professional medical evaluation. Hypertensive emergencies can cause stroke, 
            heart attack, or organ damage. For BP readings above 180/120 mmHg with symptoms, 
            seek immediate medical care. Do not attempt to drive yourself to the hospital 
            during a hypertensive crisis.
          </div>
        </div>
      )}

      {/* Inline animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bpPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 149, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 149, 0, 0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes emergencyFlash {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        input:focus {
          border-color: #ff9500 !important;
          box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.1) !important;
        }

        input:hover {
          border-color: #ff2d55;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}