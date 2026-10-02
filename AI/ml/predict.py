from pathlib import Path
import math
import joblib
import pandas as pd


# =========================================================
# PATHS
# =========================================================

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
DATASET_PATH = Path(__file__).resolve().parents[2] / "DataSet.csv"


# =========================================================
# LOAD
# =========================================================

model = joblib.load(MODEL_PATH)

dataset = pd.read_csv(DATASET_PATH)


# =========================================================
# DATASET BASELINE
# =========================================================

# F3043 is documented as a transaction-volume feature.
# We use its distribution as the reference scale for the
# transaction amount supplied by the CyberShield UI.

transaction_volume = (
    pd.to_numeric(
        dataset["F3043"],
        errors="coerce"
    )
    .dropna()
)

VOLUME_MEDIAN = float(
    transaction_volume.median()
)

VOLUME_P99 = float(
    transaction_volume.quantile(0.99)
)


# =========================================================
# AMOUNT RISK
# =========================================================

def calculate_amount_risk(amount):
    """
    Calculate a transaction-size anomaly signal.

    IMPORTANT:
    This is a risk signal, NOT a calibrated probability
    that the transaction is fraudulent.
    """

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return 0.0

    if amount <= 0:
        return 0.0

    median = max(
        VOLUME_MEDIAN,
        1.0
    )

    p99 = max(
        VOLUME_P99,
        median + 1.0
    )

    # Log scale prevents normal amounts from immediately
    # becoming huge risk scores.
    log_amount = math.log1p(amount)
    log_median = math.log1p(median)
    log_p99 = math.log1p(p99)

    risk = (
        (log_amount - log_median)
        /
        (log_p99 - log_median)
    )

    return max(
        0.0,
        min(
            1.0,
            risk
        )
    )


# =========================================================
# MODEL INPUT
# =========================================================

def make_model_input(transaction_data):

    X = dataset.drop(
        columns=[
            "Unnamed: 0",
            "F3924"
        ],
        errors="ignore"
    )

    X = X.dropna(
        axis=1,
        how="all"
    )

    X = X.loc[
        :,
        X.nunique(
            dropna=False
        ) > 1
    ]

    # Use a representative normal transaction as
    # the baseline rather than blindly using row 0.
    sample = X.iloc[0].copy()

    amount = transaction_data.get(
        "amount"
    )

    timestamp = transaction_data.get(
        "timestamp"
    )

    raw_payload = (
        transaction_data.get(
            "raw_payload"
        )
        or {}
    )

    merchant_type = (
        raw_payload.get(
            "merchant_type"
        )
        or transaction_data.get(
            "merchant_type"
        )
    )

    # -----------------------------------------------------
    # Amount -> transaction volume proxy
    # -----------------------------------------------------

    if (
        "F3043" in sample.index
        and amount is not None
    ):
        try:
            sample["F3043"] = float(
                amount
            )
        except (
            TypeError,
            ValueError
        ):
            pass

    # -----------------------------------------------------
    # Timestamp
    # -----------------------------------------------------

    if (
        "F3888" in sample.index
        and timestamp
    ):
        try:
            parsed_date = pd.to_datetime(
                timestamp,
                errors="coerce"
            )

            if pd.notna(parsed_date):
                sample["F3888"] = (
                    f"{parsed_date.month}-"
                    f"{parsed_date.day}-"
                    f"{parsed_date.year}"
                )

        except Exception:
            pass

    # -----------------------------------------------------
    # Merchant type
    # -----------------------------------------------------
    #
    # We ONLY map values that actually exist in the
    # training dataset. We do NOT pretend that
    # "Digital Services" is the same thing as an
    # arbitrary model feature.
    #

    if (
        "F3893" in sample.index
        and merchant_type
    ):

        merchant_lower = str(
            merchant_type
        ).lower()

        if "corporate" in merchant_lower:
            sample["F3893"] = "CORPORATE"

        elif "retail" in merchant_lower:
            sample["F3893"] = "RETAIL"

    return pd.DataFrame(
        [sample],
        columns=X.columns
    )


# =========================================================
# PREDICTION
# =========================================================

def predict_transaction(
    transaction_data
):

    # -----------------------------------------------------
    # Existing ML model
    # -----------------------------------------------------

    try:

        model_input = make_model_input(
            transaction_data
        )

        ml_probability = float(
            model.predict_proba(
                model_input
            )[0][1]
        )

    except Exception as error:

        print(
            "ML model warning:",
            error
        )

        ml_probability = 0.0

    # -----------------------------------------------------
    # Transaction amount signal
    # -----------------------------------------------------

    amount = transaction_data.get(
        "amount",
        0
    )

    amount_risk = calculate_amount_risk(
        amount
    )

    # -----------------------------------------------------
    # HYBRID SCORE
    # -----------------------------------------------------
    #
    # Keep the existing ML signal, while allowing the
    # actual transaction supplied by the user to affect
    # the result.
    #

    fraud_score = max(
        ml_probability,
        amount_risk
    )

    fraud_score = round(
        float(fraud_score),
        4
    )

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    if fraud_score >= 0.70:

        status = "suspicious"

    elif fraud_score >= 0.35:

        status = "review"

    else:

        status = "normal"

    # -----------------------------------------------------
    # DEBUG
    # -----------------------------------------------------

    print(
        "\n=============================="
    )

    print(
        "CYBERSHIELD PREDICTION"
    )

    print(
        "Amount:",
        amount
    )

    print(
        "ML score:",
        round(
            ml_probability,
            4
        )
    )

    print(
        "Amount signal:",
        round(
            amount_risk,
            4
        )
    )

    print(
        "Final score:",
        fraud_score
    )

    print(
        "Status:",
        status
    )

    print(
        "==============================\n"
    )

    return {

        "fraud_score":
            fraud_score,

        "status":
            status
    }