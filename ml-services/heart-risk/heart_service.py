import joblib
import pandas as pd
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "heart_model.pkl")
model = joblib.load(MODEL_PATH)

# 🔒 EXACT TRAINING COLUMNS (ORDER MATTERS)
FEATURE_COLUMNS = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "thalach",
    "exang"
]

# 🔒 SAFE DEFAULTS (NUMERIC, NO NaN)
DEFAULT_INPUT = {
    "age": 40.0,
    "sex": 1.0,
    "cp": 0.0,
    "trestbps": 120.0,
    "chol": 200.0,
    "fbs": 0.0,
    "thalach": 150.0,
    "exang": 0.0
}

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # 🔴 1. RAW INPUT FROM BACKEND / CURL
        incoming = request.get_json(force=True, silent=True)
        print("📥 RAW INPUT:", incoming)

        incoming = incoming or {}

        # 🔴 2. MAP BACKEND FIELDS → MODEL FIELDS
        mapped = {
            "age": incoming.get("age"),
            "sex": incoming.get("sex"),
            "cp": incoming.get("chest_pain"),
            "trestbps": incoming.get("resting_bp"),
            "chol": incoming.get("cholesterol"),
            "fbs": incoming.get("diabetes"),
            "thalach": incoming.get("max_heart_rate"),
            "exang": incoming.get("exercise_angina")
        }
        print("🔁 MAPPED INPUT:", mapped)

        # 🔴 3. MERGE WITH DEFAULTS + CAST
        final_input = {}
        for col in FEATURE_COLUMNS:
            try:
                final_input[col] = float(mapped.get(col))
            except:
                final_input[col] = DEFAULT_INPUT[col]

        print("🧮 FINAL NUMERIC INPUT:", final_input)

        # 🔴 4. DATAFRAME SENT TO MODEL
        df = pd.DataFrame(
            [[final_input[c] for c in FEATURE_COLUMNS]],
            columns=FEATURE_COLUMNS
        )
        print("📊 MODEL INPUT DF:\n", df)
        print("📊 DF DTYPES:\n", df.dtypes)

        # 🔴 5. MODEL PREDICTION
        prob = model.predict_proba(df)[0][1]
        print("✅ PREDICTION PROB:", prob)

        return jsonify({
            "disease": "heart_disease",
            "risk_probability": round(float(prob), 3),
            "severity": "High" if prob >= 0.30 else "Low",
            "confidence": round(abs(prob - 0.5) * 2, 3)
        })

    except Exception as e:
        print("🔥 HEART MODEL EXCEPTION 🔥")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(port=8004, debug=True)
