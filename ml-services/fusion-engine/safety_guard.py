def validate_input(patient: dict):
    required_fields = patient.keys()

    for key in required_fields:
        if patient[key] is None or patient[key] == "":
            raise ValueError(f"Missing value for {key}")

        try:
            float(patient[key])
        except:
            raise ValueError(f"Invalid numeric value for {key}")
