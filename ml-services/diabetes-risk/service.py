import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5179"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("diabetes_model.pkl")

class Patient(BaseModel):
    pregnancies: float | None = None
    glucose: float | None = None
    blood_pressure: float | None = None
    bmi: float | None = None
    age: float | None = None

def to_float(x):
    try:
        return float(x)
    except:
        return np.nan

@app.post("/predict")
def predict_diabetes(patient: Patient):
    data = pd.DataFrame([[
        to_float(patient.pregnancies),
        to_float(patient.glucose),
        to_float(patient.blood_pressure),
        to_float(patient.bmi),
        to_float(patient.age)
    ]], columns=['Pregnancies','Glucose','BloodPressure','BMI','Age'])

    prob = model.predict_proba(data)[0][1]

    return {
        "disease": "diabetes",
        "risk_probability": round(float(prob), 3),
        "severity": "High" if prob >= 0.35 else "Low",
        "confidence": round(abs(prob - 0.5) * 2, 3)
    }
