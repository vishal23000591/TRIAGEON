import { useState } from "react";
import { predictDiabetes } from "../../services/prediction.service";
import React from "react";

const detectDiabetesType = (form) => {
  const age = Number(form.age);
  const glucose = Number(form.glucose);
  const bmi = Number(form.bmi);
  const pregnancies = Number(form.pregnancies);

  // ---------------- NORMAL (NON-DIABETIC) ----------------
  if (glucose >= 70 && glucose <= 110) {
    return "Normal Blood Glucose (Non-Diabetic)";
  }

  // ---------------- GESTATIONAL DIABETES ----------------
  if (pregnancies > 0 && age >= 18 && age <= 45) {
    if (glucose >= 95 && glucose < 140) {
      return "Gestational Diabetes";
    }
  }

  // ---------------- TYPE 1 DIABETES ----------------
  if (age <= 30 && glucose >= 180 && bmi < 25) {
    return "Type 1 Diabetes";
  }

  // ---------------- TYPE 2 DIABETES ----------------
  if (age > 30 && glucose >= 140) {
    return "Type 2 Diabetes";
  }

  // ---------------- ELDERLY (65+) ----------------
  if (age >= 65 && glucose >= 180 && glucose <= 200) {
    return "Elevated Blood Glucose (Elderly – Monitor Closely)";
  }

  // ---------------- HIGH RANDOM VALUE ----------------
  if (glucose >= 200) {
    return "Diabetes Likely (Random ≥200 mg/dL – Needs Clinical Confirmation)";
  }

  return "Glucose Outside Standard Ranges – Clinical Review Required";
};

/**
 * Determine diabetes triage priority based on glucose levels and symptoms
 */
const getDiabetesTriagePriority = (glucose, severity, form) => {
  const glucoseNum = Number(glucose);
  const bp = Number(form.blood_pressure);
  const age = Number(form.age);
  
  // Critical Metabolic Emergencies
  if (glucoseNum >= 400) return "Resuscitation"; // Hyperglycemic Hyperosmolar State
  if (glucoseNum <= 54) return "Resuscitation"; // Severe Hypoglycemia
  if (glucoseNum >= 250 && bp >= 180) return "Resuscitation"; // Diabetic Crisis
  
  // Emergency Conditions
  if (glucoseNum >= 300) return "Emergent"; // Severe Hyperglycemia
  if (glucoseNum <= 70) return "Emergent"; // Hypoglycemia
  if (severity === "Critical") return "Emergent";
  
  // Urgent Conditions
  if (glucoseNum >= 200 || glucoseNum <= 80) return "Urgent"; // Hyper/Hypoglycemia
  if (severity === "High") return "Urgent";
  if (bp >= 140) return "Urgent"; // Hypertensive with glucose issues
  
  // Less Urgent Conditions
  if (glucoseNum >= 140 || glucoseNum <= 90) return "Less Urgent";
  if (severity === "Medium") return "Less Urgent";
  if (age >= 65 && glucoseNum >= 130) return "Less Urgent"; // Elderly with elevated glucose
  
  // Non-Urgent Conditions
  return "Non-Urgent";
};

/**
 * Get diabetes-specific triage details
 */
const getDiabetesTriageDetails = (priority) => {
  const triageMap = {
    "Resuscitation": {
      color: "#ff0000",
      bgColor: "#ffebee",
      borderColor: "#ff0000",
      icon: "⚕️",
      responseTime: "IMMEDIATE",
      description: "Metabolic Emergency - DKA/HHS/Severe Hypoglycemia",
      warning: "🚨 Life-Threatening Glucose Levels"
    },
    "Emergent": {
      color: "#ff5722",
      bgColor: "#fff3e0",
      borderColor: "#ff5722",
      icon: "🚨",
      responseTime: "< 15 minutes",
      description: "Severe Hyperglycemia/Hypoglycemia",
      warning: "⚠️ Risk of Metabolic Decompensation"
    },
    "Urgent": {
      color: "#ff9800",
      bgColor: "#fff8e1",
      borderColor: "#ff9800",
      icon: "⚠️",
      responseTime: "< 60 minutes",
      description: "Poor Glycemic Control",
      warning: "🩸 Needs Rapid Glucose Management"
    },
    "Less Urgent": {
      color: "#2196f3",
      bgColor: "#e3f2fd",
      borderColor: "#2196f3",
      icon: "👨‍⚕️",
      responseTime: "24-48 hours",
      description: "Elevated Glucose - Needs Evaluation",
      warning: "📋 Schedule Diabetes Consultation"
    },
    "Non-Urgent": {
      color: "#4caf50",
      bgColor: "#e8f5e9",
      borderColor: "#4caf50",
      icon: "✅",
      responseTime: "Primary Care Follow-up",
      description: "Stable Glycemic Status",
      warning: "💙 Routine Diabetes Screening"
    }
  };
  
  return triageMap[priority] || triageMap["Urgent"];
};

/**
 * Get diabetes-specific clinical pathway
 */
const getDiabetesPathway = (priority, diabetesType, glucose) => {
  const glucoseNum = Number(glucose);
  const isHyper = glucoseNum > 180;
  const isHypo = glucoseNum < 70;
  
  const pathways = {
    "Resuscitation": {
      actions: isHypo 
        ? [
            "🚑 CALL 911/112 IMMEDIATELY",
            "🍯 If conscious, give 15g fast-acting carbs",
            "🛌 Do not attempt to walk or stand",
            "📱 Notify emergency diabetes team"
          ]
        : [
            "🚑 CALL 911/112 IMMEDIATELY",
            "💧 Drink water if conscious and able",
            "💉 Check ketones if Type 1 diabetes",
            "🏥 Prepare for ICU admission"
          ],
      facility: "Emergency Department - Metabolic ICU",
      transport: "Advanced Life Support Ambulance",
      team: "Endocrinologist + Critical Care Team",
      tests: ["Blood Glucose", "Ketones", "Electrolytes", "ABG"],
      medication: isHypo ? "IV Dextrose/Glucagon" : "IV Insulin + Fluids"
    },
    "Emergent": {
      actions: isHypo
        ? [
            "🏥 Go to Emergency Department NOW",
            "🍎 Consume 15-20g fast-acting carbohydrates",
            "📱 Call diabetes care team",
            "⏰ Re-check glucose in 15 minutes"
          ]
        : [
            "🏥 Go to Emergency Department NOW",
            "💧 Hydrate with water",
            "💉 Take prescribed insulin if Type 1",
            "📋 Bring glucose logs and medications"
          ],
      facility: "Emergency Department - Medical Unit",
      transport: "Ambulance recommended",
      team: "Emergency Physician + Endocrinology Consult",
      tests: ["Blood Glucose", "HbA1c", "Renal Function", "CBC"],
      medication: isHypo ? "Oral Glucose/IV Dextrose" : "IV/SubQ Insulin"
    },
    "Urgent": {
      actions: [
        "🏥 Visit Urgent Care or Diabetes Clinic",
        "📅 Schedule same-day endocrinology consult",
        "📊 Monitor glucose every 2-4 hours",
        "💊 Adjust medications per doctor's advice"
      ],
      facility: "Diabetes Clinic or Hospital OPD",
      transport: "Private vehicle with companion",
      team: "Endocrinologist or Diabetes Specialist",
      tests: ["Fasting Glucose", "Postprandial Glucose", "HbA1c", "Lipid Profile"],
      medication: "Oral Agents/Insulin Adjustment"
    },
    "Less Urgent": {
      actions: [
        "👨‍⚕️ Schedule endocrinology appointment within 48 hours",
        "📱 Telehealth diabetes consultation",
        "📝 Start glucose monitoring log",
        "🥗 Begin diabetes education and diet planning"
      ],
      facility: "Endocrinology Clinic or Primary Care",
      transport: "Private vehicle",
      team: "Endocrinologist or Certified Diabetes Educator",
      tests: ["HbA1c", "Fasting Lipid Panel", "Renal Function", "Urine Microalbumin"],
      medication: "Initiate/Adjust Oral Hypoglycemics"
    },
    "Non-Urgent": {
      actions: [
        "📅 Schedule routine diabetes screening",
        "🏠 Continue current management plan",
        "📱 Annual diabetes follow-up",
        "💙 Maintain healthy lifestyle and diet"
      ],
      facility: "Primary Care Clinic",
      transport: "Not urgent - schedule appointment",
      team: "Primary Care Physician",
      tests: ["Annual HbA1c", "Annual Foot Exam", "Annual Eye Exam", "Annual Renal Check"],
      medication: "Routine medication management"
    }
  };
  
  const pathway = pathways[priority] || pathways["Urgent"];
  
  // Add diabetes-type specific guidance
  if (diabetesType.includes("Type 1")) {
    pathway.specificAdvice = "Monitor for ketones, insulin adjustment required";
  } else if (diabetesType.includes("Gestational")) {
    pathway.specificAdvice = "Obstetric-endocrinology consultation recommended";
  } else if (diabetesType.includes("Type 2")) {
    pathway.specificAdvice = "Lifestyle modification and oral agents first-line";
  }
  
  return pathway;
};

const DiabetesPrediction = () => {
  const [form, setForm] = useState({
    pregnancies: "",
    glucose: "",
    blood_pressure: "",
    bmi: "",
    age: "",
  });

  const [result, setResult] = useState(null);
  const [diabetesType, setDiabetesType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await predictDiabetes(form);
      setResult(res.data);

      const type = detectDiabetesType(form, res.data);
      setDiabetesType(type);
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
  const triagePriority = result ? getDiabetesTriagePriority(form.glucose, result.severity, form) : "Urgent";
  const triageDetails = getDiabetesTriageDetails(triagePriority);
  const clinicalPathway = getDiabetesPathway(triagePriority, diabetesType || "", form.glucose);

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
    background: "linear-gradient(135deg, #4da3ff 0%, #6c8eff 100%)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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

  const buttonStyle = {
    background: "linear-gradient(135deg, #4da3ff 0%, #6c8eff 100%)",
    color: "white",
    padding: "1rem 2.5rem",
    fontSize: "1.0625rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 24px rgba(77, 163, 255, 0.15)",
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
    animation: "glucosePulse 2s infinite",
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

  const diabetesTypeStyle = {
    background: "linear-gradient(135deg, #ff6b8b 0%, #ff9500 100%)",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    fontSize: "1.125rem",
    fontWeight: "600",
    marginTop: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    animation: "pulse 2s infinite",
  };

  const errorStyle = {
    background: "linear-gradient(135deg, #ff3b30 0%, #ff9500 100%)",
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
    Medium: "#ff9500",
    High: "#ff3b30",
    Critical: "#ff0000",
  };

  // Glucose level indicator function
  const getGlucoseStatus = (glucose) => {
    const glucoseNum = Number(glucose);
    if (glucoseNum < 70) return { status: "Hypoglycemia", color: "#ff0000", icon: "🔻" };
    if (glucoseNum <= 110) return { status: "Normal", color: "#4cd964", icon: "✅" };
    if (glucoseNum <= 125) return { status: "Pre-Diabetes", color: "#ff9500", icon: "⚠️" };
    if (glucoseNum <= 180) return { status: "Diabetes", color: "#ff3b30", icon: "🩸" };
    return { status: "Severe Hyperglycemia", color: "#ff0000", icon: "🚨" };
  };

  const glucoseStatus = getGlucoseStatus(form.glucose);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Diabetes Triage & Risk Assessment</h1>
        <p style={subtitleStyle}>
          Enter metabolic health metrics for AI-powered diabetes risk prediction, 
          glycemic emergency triage, and personalized management pathways
        </p>
      </div>

      <div style={formContainerStyle}>
        <form onSubmit={submit}>
          <div style={inputGroupStyle}>
            {[
              { label: "Pregnancies", field: "pregnancies", type: "number", min: "0", max: "20", note: "For gestational diabetes screening" },
              { label: "Glucose Level (mg/dL)", field: "glucose", type: "number", min: "0", max: "500", note: "Current blood glucose" },
              { label: "Blood Pressure (mmHg)", field: "blood_pressure", type: "number", min: "0", max: "300", note: "Resting BP" },
              { label: "BMI (kg/m²)", field: "bmi", type: "number", step: "0.1", min: "10", max: "80", note: "Body Mass Index" },
              { label: "Age (years)", field: "age", type: "number", min: "0", max: "120", note: "Age in years" },
            ].map(({ label, field, type, min, max, step, note }) => (
              <div key={field} style={inputWrapperStyle}>
                <label style={inputLabelStyle}>
                  {label}
                  <div style={{ position: "relative" }}>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      style={inputStyle}
                      min={min}
                      max={max}
                      step={step}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4da3ff";
                        e.target.style.boxShadow = "0 0 0 3px rgba(77, 163, 255, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e6eef8";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {field === "glucose" && form.glucose && (
                      <div style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: glucoseStatus.color,
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: `1px solid ${glucoseStatus.color}`,
                      }}>
                        {glucoseStatus.icon} {glucoseStatus.status}
                      </div>
                    )}
                  </div>
                </label>
                {note && (
                  <div style={{ fontSize: "0.75rem", color: "#5f6c7b", marginTop: "4px" }}>
                    {note}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? loadingButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(77, 163, 255, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(77, 163, 255, 0.15)";
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
                Running Metabolic Triage Analysis...
              </>
            ) : (
              <>
                <span style={{ marginRight: "0.5rem" }}>⚕️</span>
                Assess & Determine Diabetes Priority
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
            <div style={resultIconStyle}>📊</div>
            <h3 style={resultTitleStyle}>Diabetes Triage & Risk Assessment Results</h3>
          </div>

          <div style={resultGridStyle}>
            {[
              { 
                label: "Glucose Status", 
                value: glucoseStatus.status,
                icon: glucoseStatus.icon,
                style: { color: glucoseStatus.color }
              },
              { 
                label: "Diabetes Risk", 
                value: `${(parseFloat(result.risk_probability) * 100).toFixed(1)}%`,
                icon: "📈",
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
            ].map((item, index) => (
              <div 
                key={index} 
                style={resultItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(77, 163, 255, 0.1)";
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
                    fontSize: item.label === "Glucose Status" ? "1.5rem" : "1.25rem"
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ========== DIABETES TRIAGE SYSTEM ========== */}
          <div style={triageCardStyle}>
            <div style={triageHeaderStyle}>
              <div style={triageIconStyle}>{triageDetails.icon}</div>
              <h3 style={triageTitleStyle}>Metabolic Triage Priority</h3>
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
                <div style={resultLabelStyle}>Glucose Level</div>
                <div style={{ ...resultValueStyle, color: glucoseStatus.color }}>
                  {form.glucose} mg/dL
                </div>
              </div>
              
              <div style={triageItemStyle}>
                <div style={resultLabelStyle}>Triage Priority</div>
                <div style={{ ...resultValueStyle, color: triageDetails.color }}>
                  {triagePriority} Care
                </div>
              </div>
            </div>
          </div>

          {/* ========== DIABETES CLINICAL PATHWAY ========== */}
          <div style={clinicalPathwayStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🏥</span>
              <h4 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#2d3748", margin: "0" }}>
                Recommended Diabetes Care Pathway
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
                      💡 Diabetes-Specific Advice:
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
                
                <div style={{ ...resultLabelStyle, marginTop: "1rem" }}>Medication Management</div>
                <div style={{ fontSize: "0.9375rem", color: "#2d3748", marginTop: "0.25rem" }}>
                  {clinicalPathway.medication}
                </div>
              </div>
            </div>
          </div>

          {/* Diabetes Type Analysis */}
          {diabetesType && (
            <div style={diabetesTypeStyle}>
              <span style={{ fontSize: "1.5rem" }}>💡</span>
              <div>
                <div style={{ fontSize: "0.875rem", opacity: "0.9" }}>Diabetes Classification</div>
                <div style={{ fontSize: "1.125rem", fontWeight: "700" }}>{diabetesType}</div>
              </div>
            </div>
          )}

          {/* Diabetic Emergency Warning */}
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
                  DIABETIC EMERGENCY WARNING
                </div>
              </div>
              <div style={{ fontSize: "0.9375rem", color: "#b71c1c" }}>
                If you experience ANY of these symptoms, call emergency services IMMEDIATELY:
              </div>
              <ul style={{ margin: "0.5rem 0 0 1.25rem", fontSize: "0.9375rem", color: "#b71c1c" }}>
                <li>Confusion, dizziness, or loss of consciousness</li>
                <li>Rapid breathing or fruity-smelling breath (ketoacidosis)</li>
                <li>Severe dehydration, dry mouth, excessive thirst</li>
                <li>Vomiting or inability to keep fluids down</li>
                <li>Seizures or severe weakness</li>
              </ul>
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "white", borderRadius: "8px" }}>
                <div style={{ fontWeight: "600", color: "#ff0000", fontSize: "0.875rem" }}>
                  Hypoglycemia First Aid (if conscious):
                </div>
                <div style={{ fontSize: "0.875rem", color: "#d32f2f", marginTop: "0.25rem" }}>
                  15g fast-acting carbs (juice, glucose tablets) → Wait 15 minutes → Re-check glucose
                </div>
              </div>
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
              ⚕️ Diabetes Emergency Protocol Disclaimer
            </div>
            This AI triage system is for informational purposes only and does not replace 
            professional medical evaluation. Diabetes emergencies require immediate attention 
            from healthcare professionals. For glucose levels below 70 mg/dL or above 250 mg/dL 
            with symptoms, seek immediate medical care. Never delay treatment for suspected 
            diabetic ketoacidosis or severe hypoglycemia.
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes glucosePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(77, 163, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(77, 163, 255, 0);
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
          border-color: #4da3ff !important;
          box-shadow: 0 0 0 3px rgba(77, 163, 255, 0.1) !important;
        }

        input:hover {
          border-color: #d1e0ff;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default DiabetesPrediction;