from fastapi import FastAPI
from pydantic import BaseModel
from hypertension import evaluate_hypertension

app = FastAPI(title="BP Risk Service")

class BPRequest(BaseModel):
    systolic_bp: float | None = None
    diastolic_bp: float | None = None

@app.post("/predict")
def predict_bp(data: BPRequest):
    patient = data.dict()
    result = evaluate_hypertension(patient)
    return result
