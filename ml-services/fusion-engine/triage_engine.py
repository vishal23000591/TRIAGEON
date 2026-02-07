def run_triage(p):
    age = int(float(p["age"]))
    glucose = float(p["glucose"])
    systolic = float(p["systolic_bp"])
    diastolic = float(p["diastolic_bp"])
    temp = float(p["temperature"])
    cholesterol = float(p["cholesterol"])
    heart_rate = float(p["max_heart_rate"])
    diabetes = int(float(p["diabetes"]))
    chest_pain = int(float(p["chest_pain"]))

    score = 0

    # Risk scoring
    if glucose > 180:
        score += 2
    if systolic > 160 or diastolic > 100:
        score += 2
    if temp > 39:
        score += 2
    if cholesterol > 240:
        score += 1
    if heart_rate < 50 or heart_rate > 120:
        score += 2
    if diabetes == 1:
        score += 1
    if chest_pain >= 3:
        score += 3
    if age > 60:
        score += 1

    # Triage decision
    if score >= 8:
        return {
            "level": "RED",
            "department": "Emergency + ICU",
            "time": "Immediate",
            "message": "Critical condition detected",
            "patient_message": "Your condition is critical. Immediate medical care is required.",
            "confidence": 0.95
        }

    elif score >= 5:
        return {
            "level": "ORANGE",
            "department": "Cardiology + ICU Monitoring",
            "time": "Urgent (< 10 minutes)",
            "message": "Multiple serious risk factors detected",
            "patient_message": "You need urgent medical attention. Please consult a doctor immediately.",
            "confidence": 0.88
        }

    elif score >= 3:
        return {
            "level": "YELLOW",
            "department": "General Medicine",
            "time": "Monitor closely",
            "message": "Moderate risk factors present",
            "patient_message": "Some health risks detected. Monitoring and medical advice recommended.",
            "confidence": 0.75
        }

    else:
        return {
            "level": "GREEN",
            "department": "Routine Care",
            "time": "No urgency",
            "message": "Vitals within normal range",
            "patient_message": "Your vitals look normal. Maintain a healthy lifestyle.",
            "confidence": 0.92
        }
