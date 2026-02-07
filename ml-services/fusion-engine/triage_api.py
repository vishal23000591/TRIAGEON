from fastapi import FastAPI
from pydantic import BaseModel
from triage_engine import run_triage
from safety_guard import validate_input

app = FastAPI(title="TRIAGEON AI Engine")

class PatientData(BaseModel):
    age: str
    sex: str
    pregnancies: str
    glucose: str
    blood_pressure: str
    bmi: str
    chest_pain: str
    resting_bp: str
    cholesterol: str
    diabetes: str
    max_heart_rate: str
    exercise_angina: str
    systolic_bp: str
    diastolic_bp: str
    temperature: str


@app.post("/triage")
def triage_patient(data: PatientData):
    patient = data.dict()

    # 1. Safety check
    validate_input(patient)

    # 2. Run triage logic
    result = run_triage(patient)

    return {
        "status": "OK",
        "confidence_score": result["confidence"],
        "triage_decision": {
            "triage_level": result["level"],
            "department": result["department"],
            "time_to_treatment": result["time"],
            "clinical_message": result["message"]
        },
        "explanations": {
            "patient_message": result["patient_message"]
        }
    }
