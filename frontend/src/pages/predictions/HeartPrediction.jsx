import { useState } from "react";
import { predictHeart } from "../../services/prediction.service";
import React from "react";

const detectHeartDiseaseType = (form) => {
  const age = Number(form.age);
  const bp = Number(form.resting_bp);
  const cholesterol = Number(form.cholesterol);
  const chestPain = Number(form.chest_pain);
  const maxHR = Number(form.max_heart_rate);
  const angina = Number(form.exercise_angina);

  if (bp < 120 && cholesterol < 200 && chestPain === 0) {
    return "No Significant Heart Disease Indicators";
  }
  if (cholesterol >= 200 && chestPain >= 1) {
    return "Coronary Artery Disease";
  }
  if (angina === 1 && maxHR < 120) {
    return "Ischemic Heart Disease";
  }
  if (bp >= 140) {
    return "Hypertensive Heart Disease";
  }
  if (maxHR > 180 || maxHR < 60) {
    return "Possible Arrhythmia";
  }
  if (age >= 65) {
    return "Age-Related Cardiac Risk";
  }
  return "General Cardiac Risk – Further Tests Required";
};

/**
 * Determine cardiac triage priority based on risk factors
 */
const getCardiacTriagePriority = (riskProbability, severity, form) => {
  const bp = Number(form.resting_bp);
  const chestPain = Number(form.chest_pain);
  const angina = Number(form.exercise_angina);
  const riskNum = parseFloat(riskProbability);
  
  // Critical Conditions
  if (chestPain === 0 && angina === 1) return "Resuscitation"; // Typical angina with exercise angina
  if (bp >= 180) return "Resuscitation"; // Hypertensive crisis
  
  // Emergency Conditions
  if (severity === "Critical" || riskNum >= 0.8) return "Emergent";
  if (chestPain === 0 && angina === 0) return "Emergent"; // Typical angina
  
  // Urgent Conditions
  if (severity === "High" || riskNum >= 0.6) return "Urgent";
  if (bp >= 160 || bp <= 90) return "Urgent";
  
  // Less Urgent Conditions
  if (severity === "Moderate" || riskNum >= 0.4) return "Less Urgent";
  
  // Non-Urgent Conditions
  return "Non-Urgent";
};

/**
 * Get triage details with cardiac-specific information
 */
const getCardiacTriageDetails = (priority) => {
  const triageMap = {
    "Resuscitation": {
      color: "#ff0000",
      bgColor: "#ffebee",
      borderColor: "#ff0000",
      icon: "⚕️",
      responseTime: "IMMEDIATE",
      description: "Acute Cardiac Emergency - STEMI/Unstable Angina",
      warning: "🚨 Cardiac Arrest Risk"
    },
    "Emergent": {
      color: "#ff5722",
      bgColor: "#fff3e0",
      borderColor: "#ff5722",
      icon: "🚨",
      responseTime: "< 15 minutes",
      description: "Potential Acute Coronary Syndrome",
      warning: "⚠️ Possible Heart Attack"
    },
    "Urgent": {
      color: "#ff9800",
      bgColor: "#fff8e1",
      borderColor: "#ff9800",
      icon: "⚠️",
      responseTime: "< 60 minutes",
      description: "Unstable Cardiac Condition",
      warning: "🫀 Monitor for Chest Pain"
    },
    "Less Urgent": {
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      icon: "👨‍⚕️",
      responseTime: "1-2 hours",
      description: "Stable Cardiac Symptoms",
      warning: "📋 Needs Cardiac Workup"
    },
    "Non-Urgent": {
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      icon: "✅",
      responseTime: "2-4 hours or Primary Care",
      description: "Low-Risk Cardiac Assessment",
      warning: "💙 Routine Follow-up"
    }
  };
  
  return triageMap[priority] || triageMap["Urgent"];
};

/**
 * Get cardiac-specific clinical pathway
 */
const getCardiacPathway = (priority, heartType) => {
  const pathways = {
    "Resuscitation": {
      actions: [
        "🚑 CALL 911/112 IMMEDIATELY",
        "💊 Give Aspirin 325mg if not allergic",
        "🛌 Lie patient flat, keep calm",
        "📱 Notify cardiac emergency team"
      ],
      facility: "Cardiac Catheterization Lab - STEMI Center",
      transport: "Advanced Life Support Ambulance",
      team: "Interventional Cardiologist + Cardiac Team",
      tests: ["ECG", "Troponin", "Cardiac Catheterization"]
    },
    "Emergent": {
      actions: [
        "🏥 Go to Emergency Department NOW",
        "💊 Take prescribed cardiac medications",
        "📞 Call emergency contact",
        "📋 Bring all medical records"
      ],
      facility: "Emergency Department - Cardiac Unit",
      transport: "Ambulance recommended",
      team: "Emergency Cardiologist + Nursing",
      tests: ["ECG", "Cardiac Enzymes", "Echocardiogram"]
    },
    "Urgent": {
      actions: [
        "🏥 Visit Cardiac Urgent Care",
        "📅 Schedule same-day cardiology consult",
        "🩺 Monitor blood pressure hourly",
        "💊 Continue prescribed medications"
      ],
      facility: "Cardiac Urgent Care or Emergency Department",
      transport: "Private vehicle with companion",
      team: "Cardiologist or Cardiac Specialist",
      tests: ["ECG", "Stress Test", "Holter Monitor"]
    },
    "Less Urgent": {
      actions: [
        "👨‍⚕️ Schedule cardiology appointment within 48 hours",
        "📱 Telehealth consultation available",
        "📝 Document symptom patterns",
        "💊 Review current medications with doctor"
      ],
      facility: "Cardiology Clinic or Hospital OPD",
      transport: "Private vehicle",
      team: "Cardiologist or Primary Care with Cardiac Focus",
      tests: ["ECG", "Blood Tests", "Cholesterol Panel"]
    },
    "Non-Urgent": {
      actions: [
        "📅 Schedule routine cardiology check-up",
        "🏠 Continue current care plan",
        "📱 Follow-up if symptoms change",
        "💙 Maintain heart-healthy lifestyle"
      ],
      facility: "Primary Care Clinic",
      transport: "Not urgent - schedule appointment",
      team: "Primary Care Physician",
      tests: ["Annual ECG", "Lipid Profile", "Blood Pressure Monitoring"]
    }
  };
  
  const pathway = pathways[priority] || pathways["Urgent"];
  
  // Add heart-type specific guidance
  if (heartType.includes("Artery Disease")) {
    pathway.specificAdvice = "Coronary angiography may be indicated";
  } else if (heartType.includes("Arrhythmia")) {
    pathway.specificAdvice = "Consider Holter monitor or event recorder";
  } else if (heartType.includes("Hypertensive")) {
    pathway.specificAdvice = "Blood pressure control and monitoring essential";
  }
  
  return pathway;
};

export default function HeartPrediction() {
  const [form, setForm] = useState({
    age: "",
    sex: "",
    chest_pain: "",
    resting_bp: "",
    cholesterol: "",
    diabetes: "",
    max_heart_rate: "",
    exercise_angina: ""
  });
  const [result, setResult] = useState(null);
  const [heartType, setHeartType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        age: Number(form.age),
        sex: Number(form.sex),
        chest_pain: Number(form.chest_pain),
        resting_bp: Number(form.resting_bp),
        cholesterol: Number(form.cholesterol),
        diabetes: Number(form.diabetes),
        max_heart_rate: Number(form.max_heart_rate),
        exercise_angina: Number(form.exercise_angina)
      };

      const res = await predictHeart(payload);
      setResult(res.data);

      const type = detectHeartDiseaseType(form);
      setHeartType(type);
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Calculate triage priority if results exist
  const triagePriority = result ? getCardiacTriagePriority(result.risk_probability, result.severity, form) : "Urgent";
  const triageDetails = getCardiacTriageDetails(triagePriority);
  const clinicalPathway = getCardiacPathway(triagePriority, heartType || "");

  const containerStyle = {
    maxWidth: "1000px",
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
    background: "linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)",
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

  const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
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
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    borderRadius: "10px",
    border: "2px solid #e6eef8",
    background: "#ffffff",
    color: "#1a1a1a",
    transition: "all 0.3s ease",
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235f6c7b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "1em",
    paddingRight: "2.5rem",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)",
    color: "white",
    padding: "1rem 2.5rem",
    fontSize: "1.0625rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(255, 59, 48, 0.15)",
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
    animation: "cardiacPulse 2s infinite",
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

  const heartTypeStyle = {
    background: "linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)",
    color: "white",
    padding: "1.25rem 1.75rem",
    borderRadius: "12px",
    fontSize: "1.125rem",
    fontWeight: "600",
    marginTop: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    animation: "heartPulse 2s infinite ease-in-out",
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

  const severityColors = {
    Low: "#4cd964",
    Moderate: "#ff9500",
    High: "#ff3b30",
    Critical: "#ff0000",
    "Very High": "#ff2d55",
  };

  const chestPainOptions = [
    { value: "0", label: "Typical Angina (Chest pain related to heart)" },
    { value: "1", label: "Atypical Angina (Non-specific chest pain)" },
    { value: "2", label: "Non-Anginal Pain (Not heart-related)" },
    { value: "3", label: "Asymptomatic (No chest pain)" },
  ];

  const yesNoOptions = [
    { value: "0", label: "No" },
    { value: "1", label: "Yes" },
  ];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Cardiac Triage & Risk Assessment</h1>
        <p style={subtitleStyle}>
          Enter cardiovascular metrics for AI-powered risk prediction, clinical triage, 
          and emergency cardiac care pathway recommendations
        </p>
      </div>

      <div style={formContainerStyle}>
        <form onSubmit={submit}>
          <div style={formGridStyle}>
            {/* Demographic Information */}
            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Age (years)
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  style={inputStyle}
                  min="0"
                  max="120"
                  required
                />
              </label>
            </div>

            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Gender
                <select
                  value={form.sex}
                  onChange={(e) => handleInputChange("sex", e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </label>
            </div>

            {/* Clinical Measurements */}
            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Resting Blood Pressure (mmHg)
                <input
                  type="number"
                  value={form.resting_bp}
                  onChange={(e) => handleInputChange("resting_bp", e.target.value)}
                  style={inputStyle}
                  min="0"
                  max="300"
                  required
                />
              </label>
            </div>

            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Cholesterol (mg/dL)
                <input
                  type="number"
                  value={form.cholesterol}
                  onChange={(e) => handleInputChange("cholesterol", e.target.value)}
                  style={inputStyle}
                  min="0"
                  max="600"
                  required
                />
              </label>
            </div>

            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Maximum Heart Rate (bpm)
                <input
                  type="number"
                  value={form.max_heart_rate}
                  onChange={(e) => handleInputChange("max_heart_rate", e.target.value)}
                  style={inputStyle}
                  min="0"
                  max="250"
                  required
                />
              </label>
            </div>

            {/* Medical History */}
            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Chest Pain Type
                <select
                  value={form.chest_pain}
                  onChange={(e) => handleInputChange("chest_pain", e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Chest Pain Type</option>
                  {chestPainOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Exercise-Induced Angina
                <select
                  value={form.exercise_angina}
                  onChange={(e) => handleInputChange("exercise_angina", e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Option</option>
                  {yesNoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={inputWrapperStyle}>
              <label style={inputLabelStyle}>
                Diabetes History
                <select
                  value={form.diabetes}
                  onChange={(e) => handleInputChange("diabetes", e.target.value)}
                  style={selectStyle}
                  required
                >
                  <option value="">Select Option</option>
                  {yesNoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? loadingButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 59, 48, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 59, 48, 0.15)";
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-3px)";
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: "0.5rem" }}>⏳</span>
                Running Cardiac Triage Analysis...
              </>
            ) : (
              <>
                <span style={{ marginRight: "0.5rem" }}>⚕️</span>
                Assess & Determine Cardiac Priority
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div style={errorStyle}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={resultCardStyle}>
          <div style={resultHeaderStyle}>
            <div style={resultIconStyle}>❤️</div>
            <h3 style={resultTitleStyle}>Cardiac Risk & Triage Assessment Results</h3>
          </div>

          <div style={resultGridStyle}>
            {[
              { 
                label: "Heart Disease Risk", 
                value: `${(parseFloat(result.risk_probability) * 100).toFixed(1)}%`,
                icon: "📊",
                style: { 
                  color: result.risk_probability >= 0.7 ? "#ff0000" : 
                         result.risk_probability >= 0.5 ? "#ff3b30" :
                         result.risk_probability >= 0.3 ? "#ff9500" : "#4cd964" 
                }
              },
              { 
                label: "Severity Level", 
                value: result.severity,
                icon: "⚠️",
                style: { color: severityColors[result.severity] || "#5f6c7b" }
              },
              { 
                label: "AI Confidence", 
                value: `${(parseFloat(result.confidence) * 100).toFixed(1)}%`,
                icon: "🎯"
              },
              { 
                label: "Cardiac Stability", 
                value: result.severity === "Low" || result.severity === "Moderate" 
                  ? "Stable" 
                  : "Unstable - Requires Monitoring",
                icon: "📈",
                style: { color: (result.severity === "Low" || result.severity === "Moderate") ? "#4cd964" : "#ff3b30" }
              },
            ].map((item, index) => (
              <div 
                key={index} 
                style={resultItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 59, 48, 0.1)";
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
                    fontSize: item.label === "Heart Disease Risk" ? "1.5rem" : "1.25rem"
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ========== CARDIAC TRIAGE SYSTEM ========== */}
          <div style={triageCardStyle}>
            <div style={triageHeaderStyle}>
              <div style={triageIconStyle}>{triageDetails.icon}</div>
              <h3 style={triageTitleStyle}>Cardiac Triage Priority</h3>
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
                <div style={resultLabelStyle}>Clinical Priority</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color }}>
                  {triagePriority} Cardiac Care
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Risk Level</div>
                <div style={{ ...resultValueStyle, color: severityColors[result.severity] }}>
                  {result.severity}
                </div>
              </div>
            </div>
          </div>

          {/* ========== CARDIAC CLINICAL PATHWAY ========== */}
          <div style={clinicalPathwayStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏥</span>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#2d3748", margin: "0" }}>
                Recommended Cardiac Care Pathway
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
                
                {clinicalPathway.specificAdvice && (
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#e3f2fd", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#2196f3" }}>
                      💡 Specific Advice:
                    </div>
                    <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      {clinicalPathway.specificAdvice}
                    </div>
                  </div>
                )}
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
              </div>
            </div>
          </div>

          {/* Heart Type Analysis */}
          {heartType && (
            <div style={heartTypeStyle}>
              <span style={{ fontSize: "1.75rem" }}>💡</span>
              <div>
                <div style={{ fontSize: "0.875rem", opacity: "0.9" }}>Suspected Heart Condition</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>{heartType}</div>
              </div>
            </div>
          )}

          {/* Red Flag Symptoms Warning */}
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
                  CARDIAC RED FLAG SYMPTOMS
                </div>
              </div>
              <div style={{ fontSize: "0.9375rem", color: "#b71c1c" }}>
                If you experience ANY of these symptoms, call emergency services IMMEDIATELY:
              </div>
              <ul style={{ margin: "0.5rem 0 0 1.25rem", fontSize: "0.9375rem", color: "#b71c1c" }}>
                <li>Chest pain spreading to arms, neck, jaw, or back</li>
                <li>Severe shortness of breath or difficulty breathing</li>
                <li>Sudden dizziness, fainting, or loss of consciousness</li>
                <li>Rapid or irregular heartbeat with chest discomfort</li>
                <li>Cold sweat, nausea, or vomiting with chest pain</li>
              </ul>
            </div>
          )}

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
              ⚕️ Cardiac Emergency Protocol Disclaimer
            </div>
            This AI triage system is for informational purposes only and does not replace 
            professional medical evaluation. Cardiac conditions require immediate attention 
            from healthcare professionals. If you experience chest pain lasting more than 
            5 minutes, call emergency services immediately. Do not attempt to drive yourself 
            to the hospital during cardiac symptoms.
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

        @keyframes heartPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 24px rgba(255, 59, 48, 0.15);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 12px 32px rgba(255, 59, 48, 0.25);
          }
        }

        @keyframes cardiacPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
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

        input:focus, select:focus {
          border-color: #ff3b30 !important;
          box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1) !important;
        }

        input:hover, select:hover {
          border-color: #ff9500;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}