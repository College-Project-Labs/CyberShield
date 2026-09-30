from pathlib import Path
import joblib
import pandas as pd


MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

model = joblib.load(MODEL_PATH)


def predict_transaction(transaction_data):
    transaction_df = pd.DataFrame([transaction_data])

    fraud_probability = model.predict_proba(transaction_df)[0][1]

    fraud_score = round(float(fraud_probability), 4)

    if fraud_score >= 0.5:
        status = "suspicious"
    else:
        status = "normal"

    return {
        "fraud_score": fraud_score,
        "status": status
    }
