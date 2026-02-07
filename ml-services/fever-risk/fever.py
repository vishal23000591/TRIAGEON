def to_float(x):
    try:
        if x == "" or x is None:
            return None
        return float(x)
    except:
        return None

def evaluate_infection(patient: dict):
    temp = to_float(patient.get("temperature"))

    if temp is None:
        return {
            "disease": "infection",
            "severity": "Unknown",
            "risk_probability": None,
            "confidence": 0.0
        }

    if temp >= 40.0:
        severity, risk = "Critical Fever", 0.95
    elif temp >= 39.0:
        severity, risk = "High Fever", 0.80
    elif temp >= 38.5:
        severity, risk = "Moderate Fever", 0.65
    elif temp >= 38.0:
        severity, risk = "Mild Fever", 0.50
    elif temp >= 37.5:
        severity, risk = "Low-Grade Fever", 0.35
    elif temp >= 36.1:
        severity, risk = "Normal", 0.10
    elif temp >= 35.0:
        severity, risk = "Mild Hypothermia", 0.50
    else:
        severity, risk = "Severe Hypothermia", 0.90

    return {
        "disease": "infection",
        "severity": severity,
        "risk_probability": risk,
        "confidence": 1.0
    }
