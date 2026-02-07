from fastapi import FastAPI
from pydantic import BaseModel
from fever import evaluate_infection

app = FastAPI(title="Fever Risk Service")

class FeverRequest(BaseModel):
    temperature: float | None = None

@app.post("/predict")
def predict_fever(data: FeverRequest):
    return evaluate_infection(data.dict())
