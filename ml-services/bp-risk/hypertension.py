# ml-services/bp-risk/hypertension.py

def to_float(x):
    try:
        if x == "" or x is None:
            return None
        return float(x)
    except:
        return None


def evaluate_hypertension(patient: dict):
    sbp = to_float(patient.get("systolic_bp"))
    dbp = to_float(patient.get("diastolic_bp"))

    if sbp is None or dbp is None:
        return {
            "disease": "hypertension",
            "severity": "Unknown",
            "risk_probability": None,
            "confidence": 0.0
        }

    if sbp >= 180 or dbp >= 120:
        stage = "Hypertensive Crisis"
        risk = 0.95
    elif sbp >= 140 or dbp >= 90:
        stage = "Stage 2"
        risk = 0.75
    elif sbp >= 130 or dbp >= 80:
        stage = "Stage 1"
        risk = 0.50
    elif sbp >= 120 and dbp < 80:
        stage = "Elevated"
        risk = 0.30
    else:
        stage = "Normal"
        risk = 0.10

    return {
        "disease": "hypertension",
        "severity": stage,
        "risk_probability": float(risk),
        "confidence": 1.0
    }
