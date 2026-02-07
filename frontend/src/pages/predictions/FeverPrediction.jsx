import React, { useState } from "react";
import { predictFever } from "../../services/prediction.service";

/**
 * @typedef {
 *  "Normal" |
 *  "Low-Grade Fever" |
 *  "Mild Fever" |
 *  "Moderate Fever" |
 *  "High Fever" |
 *  "Critical Fever" |
 *  "Mild Hypothermia" |
 *  "Severe Hypothermia" |
 *  "Unknown"
 * } FeverSeverity
 */

/**
 * @typedef {Object} FeverPredictionResult
 * @property {"infection"} disease
 * @property {FeverSeverity} severity
 * @property {number | null} risk_probability
 * @property {number} confidence
 */

/**
 * Triage Priority Levels
 * @typedef {"Resuscitation" | "Emergent" | "Urgent" | "Less Urgent" | "Non-Urgent"} TriagePriority
 */

/**
 * Determine fever category based on temperature
 */
const getFeverCategory = (temp) => {
  const tempNum = Number(temp);
  
  if (tempNum < 35) return "Severe Hypothermia";
  if (tempNum < 36) return "Mild Hypothermia";
  if (tempNum < 37.2) return "Normal";
  if (tempNum < 38) return "Low-Grade Fever";
  if (tempNum < 38.9) return "Mild Fever";
  if (tempNum < 39.4) return "Moderate Fever";
  if (tempNum < 40) return "High Fever";
  if (tempNum >= 40) return "Critical Fever";
  
  return "Unknown";
};

/**
 * Determine triage priority based on fever severity and temperature
 */
const getTriagePriority = (severity, temperature) => {
  const tempNum = Number(temperature);
  
  if (severity === "Critical Fever" || tempNum >= 40.5) return "Resuscitation";
  if (severity === "High Fever" || tempNum >= 39.5) return "Emergent";
  if (severity === "Moderate Fever") return "Urgent";
  if (severity === "Mild Fever" || severity === "Low-Grade Fever") return "Less Urgent";
  if (severity === "Severe Hypothermia") return "Emergent";
  if (severity === "Mild Hypothermia") return "Urgent";
  if (severity === "Normal") return "Non-Urgent";
  
  return "Urgent"; // Default fallback
};

/**
 * Get triage color and icon
 */
const getTriageDetails = (priority) => {
  const triageMap = {
    "Resuscitation": {
      color: "#ff0000",
      bgColor: "#ffebee",
      borderColor: "#ff0000",
      icon: "⚕️",
      responseTime: "IMMEDIATE",
      description: "Life-threatening condition"
    },
    "Emergent": {
      color: "#ff5722",
      bgColor: "#fff3e0",
      borderColor: "#ff5722",
      icon: "🚨",
      responseTime: "< 15 minutes",
      description: "Potentially life-threatening"
    },
    "Urgent": {
      color: "#ff9800",
      bgColor: "#fff8e1",
      borderColor: "#ff9800",
      icon: "⚠️",
      responseTime: "< 60 minutes",
      description: "Serious but not immediately life-threatening"
    },
    "Less Urgent": {
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      icon: "👨‍⚕️",
      responseTime: "1-2 hours",
      description: "Requires medical evaluation"
    },
    "Non-Urgent": {
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      icon: "✅",
      responseTime: "2-4 hours or primary care",
      description: "Routine care recommended"
    }
  };
  
  return triageMap[priority] || triageMap["Urgent"];
};

/**
 * Get clinical recommendations based on triage priority
 */
const getClinicalPathway = (priority) => {
  const pathways = {
    "Resuscitation": {
      actions: [
        "🚑 Call Emergency Services (911/112)",
        "⚕️ Prepare for hospital admission",
        "📋 Gather medical history and medications",
        "🩺 Monitor vital signs continuously"
      ],
      facility: "Emergency Department - Resuscitation Room",
      transport: "Ambulance with paramedics",
      team: "Emergency Physician + Critical Care Team"
    },
    "Emergent": {
      actions: [
        "🏥 Go to Emergency Department now",
        "📞 Notify emergency contact",
        "📋 Bring identification and insurance",
        "💊 Take current medications with you"
      ],
      facility: "Emergency Department - Acute Care",
      transport: "Ambulance or private vehicle if stable",
      team: "Emergency Physician + Nursing Staff"
    },
    "Urgent": {
      actions: [
        "🏥 Visit Urgent Care Center",
        "📅 Schedule same-day appointment if available",
        "🌡️ Monitor symptoms every 2 hours",
        "💧 Maintain hydration"
      ],
      facility: "Urgent Care or Emergency Department",
      transport: "Private vehicle",
      team: "Urgent Care Physician"
    },
    "Less Urgent": {
      actions: [
        "👨‍⚕️ Schedule doctor appointment within 24 hours",
        "📱 Consider telemedicine consultation",
        "📝 Track symptom progression",
        "💊 Use over-the-counter relief as directed"
      ],
      facility: "Primary Care Clinic",
      transport: "Private vehicle or public transport",
      team: "Primary Care Physician"
    },
    "Non-Urgent": {
      actions: [
        "📅 Schedule routine appointment",
        "🏠 Home care with monitoring",
        "📱 Follow-up if symptoms worsen",
        "💤 Rest and maintain normal activities"
      ],
      facility: "Primary Care Clinic or Telehealth",
      transport: "Not required immediately",
      team: "Primary Care Physician or Nurse"
    }
  };
  
  return pathways[priority] || pathways["Urgent"];
};

/**
 * Get fever level description
 */
const getFeverLevelDescription = (severity, temperature) => {
  const descriptions = {
    "Normal": `Your temperature of ${temperature}°C is within the normal range.`,
    "Low-Grade Fever": `Temperature of ${temperature}°C indicates low-grade fever. Monitor for other symptoms.`,
    "Mild Fever": `${temperature}°C suggests mild fever. Rest and stay hydrated.`,
    "Moderate Fever": `${temperature}°C indicates moderate fever. Consider medical consultation.`,
    "High Fever": `${temperature}°C is high fever. Seek medical attention.`,
    "Critical Fever": `${temperature}°C is critical. Urgent medical care required.`,
    "Mild Hypothermia": `${temperature}°C is below normal. Keep warm and monitor.`,
    "Severe Hypothermia": `${temperature}°C indicates severe hypothermia. Emergency care needed.`,
    "Unknown": "Please consult with a healthcare professional for accurate assessment."
  };
  return descriptions[severity] || descriptions["Unknown"];
};

/**
 * Get recommendations based on fever severity
 */
const getFeverRecommendations = (severity) => {
  const recommendations = {
    "Normal": [
      "Maintain normal hydration",
      "Continue regular activities",
      "Routine temperature checks"
    ],
    "Low-Grade Fever": [
      "Increase fluid intake",
      "Rest and monitor symptoms",
      "Check temperature every 4-6 hours"
    ],
    "Mild Fever": [
      "Rest adequately",
      "Stay hydrated",
      "Consider fever reducers if advised",
      "Monitor closely"
    ],
    "Moderate Fever": [
      "Consult healthcare provider",
      "Regular temperature monitoring",
      "Proper hydration",
      "Avoid strenuous activities"
    ],
    "High Fever": [
      "Seek medical attention",
      "Use fever medication as directed",
      "Cool compress application",
      "Emergency contact ready"
    ],
    "Critical Fever": [
      "Call emergency services",
      "Do not delay treatment",
      "Cool environment",
      "Hospital care required"
    ],
    "Mild Hypothermia": [
      "Warm clothing and blankets",
      "Warm drinks",
      "Avoid alcohol",
      "Monitor temperature"
    ],
    "Severe Hypothermia": [
      "Call emergency services immediately",
      "Handle gently",
      "Warm center first",
      "Hospital care required"
    ]
  };
  return recommendations[severity] || ["Consult healthcare professional"];
};

/**
 * Get infection risk level
 */
const getInfectionRisk = (severity) => {
  const risks = {
    "Normal": "Low",
    "Low-Grade Fever": "Low to Moderate",
    "Mild Fever": "Moderate",
    "Moderate Fever": "High",
    "High Fever": "Very High",
    "Critical Fever": "Critical",
    "Mild Hypothermia": "Low",
    "Severe Hypothermia": "Moderate"
  };
  return risks[severity] || "Unknown";
};

export default function FeverPrediction() {
  const [temperature, setTemperature] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    if (!temperature) {
      setError("Please enter your body temperature");
      return;
    }

    const tempNum = Number(temperature);
    if (tempNum < 30 || tempNum > 45) {
      setError("Please enter a valid temperature between 30°C and 45°C");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await predictFever({
        temperature: tempNum
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
  const feverCategory = result ? getFeverCategory(temperature) : "Unknown";
  const infectionRisk = getInfectionRisk(feverCategory);
  const triagePriority = result ? getTriagePriority(feverCategory, temperature) : "Urgent";
  const triageDetails = getTriageDetails(triagePriority);
  const clinicalPathway = getClinicalPathway(triagePriority);

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
    background: "linear-gradient(135deg, #5ac8fa 0%, #007aff 100%)",
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

  const inputWrapperStyle = {
    position: "relative",
    marginBottom: "2rem",
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
    fontSize: "1.5rem",
    borderRadius: "12px",
    border: "2px solid #e6eef8",
    background: "#ffffff",
    color: "#1a1a1a",
    transition: "all 0.3s ease",
    outline: "none",
    textAlign: "center",
    fontWeight: "600",
  };

  const temperatureUnitStyle = {
    position: "absolute",
    right: "1.25rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#007aff",
  };

  const temperatureSliderStyle = {
    marginTop: "1rem",
    width: "100%",
  };

  const sliderLabelsStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: "#5f6c7b",
  };

  const buttonStyle = {
    background: "linear-gradient(135deg, #5ac8fa 0%, #007aff 100%)",
    color: "white",
    padding: "1rem 2.5rem",
    fontSize: "1.0625rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(90, 200, 250, 0.15)",
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

  const temperatureDisplayStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "linear-gradient(135deg, #e6f2ff 0%, #d1e8ff 100%)",
    borderRadius: "12px",
    border: "2px solid #b3d9ff",
  };

  const tempValueStyle = {
    fontSize: "3.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
    lineHeight: "1",
  };

  const tempUnitStyle = {
    fontSize: "1.5rem",
    color: "#007aff",
    fontWeight: "600",
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

  const feverCategoryStyle = {
    background: "linear-gradient(135deg, #5ac8fa 0%, #007aff 100%)",
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
    animation: "feverPulse 2s infinite ease-in-out",
  };

  // TRIAGE CARD STYLES
  const triageCardStyle = {
    background: triageDetails.bgColor,
    border: `3px solid ${triageDetails.borderColor}`,
    borderRadius: "14px",
    padding: "1.5rem",
    margin: "2rem 0",
    animation: "pulseGlow 2s infinite",
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
    "Low-Grade Fever": "#ffcc00",
    "Mild Fever": "#ff9500",
    "Moderate Fever": "#ff3b30",
    "High Fever": "#ff2d55",
    "Critical Fever": "#ff0000",
    "Mild Hypothermia": "#5ac8fa",
    "Severe Hypothermia": "#007aff",
    "Unknown": "#5f6c7b"
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Fever & Infection Risk Assessment</h1>
        <p style={subtitleStyle}>
          Enter your body temperature for AI-powered infection risk assessment 
          and clinical triage recommendations
        </p>
      </div>

      <div style={formContainerStyle}>
        <div style={inputWrapperStyle}>
          <label style={inputLabelStyle}>
            Body Temperature
            <div style={{ position: "relative" }}>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={inputStyle}
                placeholder="Enter your temperature"
                min="30"
                max="45"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = "#5ac8fa";
                  e.target.style.boxShadow = "0 0 0 3px rgba(90, 200, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e6eef8";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={temperatureUnitStyle}>°C</div>
            </div>
          </label>
          
          {/* Temperature Scale Guide */}
          <div style={temperatureSliderStyle}>
            <div style={sliderLabelsStyle}>
              <span>30°C</span>
              <span>35°C (Hypothermia)</span>
              <span>37°C (Normal)</span>
              <span>38°C (Fever)</span>
              <span>45°C</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading || !temperature}
          style={loading || !temperature ? loadingButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!loading && temperature) {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(90, 200, 250, 0.25)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && temperature) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(90, 200, 250, 0.15)";
            }
          }}
          onMouseDown={(e) => {
            if (!loading && temperature) {
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseUp={(e) => {
            if (!loading && temperature) {
              e.currentTarget.style.transform = "translateY(-3px)";
            }
          }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: "0.5rem" }}>⏳</span>
              Running Clinical Triage...
            </>
          ) : (
            <>
              <span style={{ marginRight: "0.5rem" }}>⚕️</span>
              Assess & Triage
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
            <div style={resultIconStyle}>🤒</div>
            <h3 style={resultTitleStyle}>Fever & Infection Assessment Results</h3>
          </div>

          {/* Temperature Display */}
          <div style={temperatureDisplayStyle}>
            <div style={tempValueStyle}>{temperature}</div>
            <div style={tempUnitStyle}>°C</div>
            <div style={{ marginLeft: "1rem", color: "#5f6c7b" }}>
              Body Temperature Reading
            </div>
          </div>

          <div style={resultGridStyle}>
            {[
              { 
                label: "Fever Severity", 
                value: result.severity,
                icon: "🌡️",
                style: { color: severityColors[result.severity] || "#5f6c7b" }
              },
              { 
                label: "Infection Risk", 
                value: infectionRisk,
                icon: "🦠",
                style: { 
                  color: infectionRisk === "Critical" ? "#ff0000" : 
                         infectionRisk === "Very High" ? "#ff2d55" :
                         infectionRisk === "High" ? "#ff3b30" :
                         infectionRisk === "Moderate" ? "#ff9500" :
                         infectionRisk === "Low" ? "#4cd964" : "#5f6c7b" 
                }
              },
              { 
                label: "Risk Probability", 
                value: `${(parseFloat(result.risk_probability) * 100).toFixed(1)}%`,
                icon: "📈"
              },
              { 
                label: "AI Confidence", 
                value: `${(parseFloat(result.confidence) * 100).toFixed(1)}%`,
                icon: "🎯"
              },
            ].map((item, index) => (
              <div 
                key={index} 
                style={resultItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 200, 250, 0.1)";
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
                    fontSize: item.label === "Fever Severity" ? "1.5rem" : "1.25rem"
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ========== TRIAGE SYSTEM ========== */}
          <div style={triageCardStyle}>
            <div style={triageHeaderStyle}>
              <div style={triageIconStyle}>{triageDetails.icon}</div>
              <h3 style={triageTitleStyle}>Clinical Triage Priority</h3>
              <div style={triageBadgeStyle}>{triagePriority.toUpperCase()}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ 
                width: "12px", 
                height: "12px", 
                borderRadius: "50%", 
                background: triageDetails.color,
                animation: "pulse 1.5s infinite"
              }} />
              <div style={{ fontSize: "1rem", color: triageDetails.color, fontWeight: "600" }}>
                {triageDetails.description}
              </div>
            </div>

            <div style={triageGridStyle}>
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Response Time</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color }}>
                  {triageDetails.responseTime}
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Priority Level</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color }}>
                  {triagePriority}
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Temperature Category</div>
                <div style={{ ...resultValueStyle, color: severityColors[feverCategory] }}>
                  {feverCategory}
                </div>
              </div>
            </div>
          </div>

          {/* ========== CLINICAL PATHWAY ========== */}
          <div style={clinicalPathwayStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏥</span>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#2d3748", margin: "0" }}>
                Recommended Clinical Pathway
              </h4>
            </div>

            <div style={pathwayGridStyle}>
              <div style={pathwayItemStyle}>
                <div style={resultLabelStyle}>Immediate Actions</div>
                <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem" }}>
                  {clinicalPathway.actions.map((action, idx) => (
                    <li key={idx} style={{ marginBottom: "0.5rem", fontSize: "0.9375rem" }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div style={pathwayItemStyle}>
                <div style={resultLabelStyle}>Medical Facility</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem", marginBottom: "1rem" }}>
                  {clinicalPathway.facility}
                </div>
                
                <div style={resultLabelStyle}>Transport</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem", marginBottom: "1rem" }}>
                  {clinicalPathway.transport}
                </div>
                
                <div style={resultLabelStyle}>Care Team</div>
                <div style={{ ...resultValueStyle, fontSize: "1.125rem" }}>
                  {clinicalPathway.team}
                </div>
              </div>
            </div>
          </div>

          {/* Fever Category Analysis */}
          <div style={feverCategoryStyle}>
            <span style={{ fontSize: "1.75rem" }}>📊</span>
            <div>
              <div style={{ fontSize: "0.875rem", opacity: "0.9" }}>Temperature Category</div>
              <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>{feverCategory}</div>
            </div>
          </div>

          {/* Fever Level Description */}
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
            {getFeverLevelDescription(result.severity, temperature)}
          </div>

          {/* Recommendations */}
          <div style={recommendationsStyle}>
            <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "1rem", fontSize: "1.125rem" }}>
              💡 Self-Care Recommendations
            </div>
            <div style={recommendationListStyle}>
              {getFeverRecommendations(result.severity).map((rec, idx) => (
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
              ⚕️ Important Medical Disclaimer
            </div>
            This AI assessment and triage system is for informational purposes only. Body temperature readings 
            can vary throughout the day. Always consult with healthcare professionals for 
            diagnosis and treatment. If you experience difficulty breathing, severe headache, 
            confusion, chest pain, or persistent high fever, seek immediate medical attention.
            In emergencies, call local emergency services immediately.
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

        @keyframes feverPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 24px rgba(90, 200, 250, 0.15);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 12px 32px rgba(90, 200, 250, 0.25);
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

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 59, 48, 0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        input:focus {
          border-color: #5ac8fa !important;
          box-shadow: 0 0 0 3px rgba(90, 200, 250, 0.1) !important;
        }

        input:hover {
          border-color: #007aff;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}