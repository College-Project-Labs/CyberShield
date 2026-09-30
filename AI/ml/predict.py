from pathlib import Path
import joblib
import pandas as pd


# Load trained model
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"

model = joblib.load(MODEL_PATH)


def predict_transaction(transaction_data):
    """
    Predict whether a transaction is suspicious.

    transaction_data should contain the same feature columns
    that were used during model training.
    """

    # Convert transaction dictionary into DataFrame
    transaction_df = pd.DataFrame([transaction_data])

    # Get fraud probability
    fraud_probability = model.predict_proba(transaction_df)[0][1]

    # Convert probability to percentage
    fraud_score = round(float(fraud_probability), 4)

    # Decide status
    if fraud_score >= 0.5:
        status = "suspicious"
    else:
        status = "normal"

    return {
        "fraud_score": fraud_score,
        "status": status
    }