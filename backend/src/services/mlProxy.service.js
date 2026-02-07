import axios from "axios";

export const predictDiabetes = async (patientData) => {
  const { data } = await axios.post(
    `${process.env.ML_DIABETES_URL}/predict`,
    patientData,
    { timeout: 10000 }
  );
  return data;
};

export const predictHeart = async (patientData) => {
  const { data } = await axios.post(
    `${process.env.ML_HEART_URL}/predict`,
    patientData,
    { timeout: 10000 }
  );
  return data;
};

export const predictBP = async (patientData) => {
  const { data } = await axios.post(
    `${process.env.ML_BP_URL}/predict`,
    patientData,
    { timeout: 10000 }
  );
  return data;
};
const TRIAGE_AI_URL = "http://127.0.0.1:8000/triage";

export const runTriageAI = async (patientData) => {
  try {
    const response = await axios.post(TRIAGE_AI_URL, patientData, {
      headers: { "Content-Type": "application/json" },
      timeout: 8000
    });

    return response.data;
  } catch (error) {
    console.error("AI TRIAGE ERROR:", error.message);
    throw new Error("AI triage service unavailable");
  }
};
