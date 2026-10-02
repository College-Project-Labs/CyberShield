def investigate_transaction(transaction_data, prediction, context):

    fraud_score = prediction["fraud_score"]
    status = prediction["status"]

    if status == "suspicious":

        reason = (
            f"CyberShield detected an anomalous transaction with a "
            f"fraud score of {fraud_score}. The transaction should be "
            f"investigated using multiple signals such as transaction "
            f"amount, timing, frequency, and merchant behavior."
        )

        risk_level = "HIGH"

        recommendation = (
            "Review the transaction against the user's historical "
            "behavior and verify the merchant and transaction details."
        )

    else:

        reason = (
            f"CyberShield did not detect strong anomalous characteristics "
            f"in this transaction. The fraud score was {fraud_score}."
        )

        risk_level = "LOW"

        recommendation = (
            "No immediate investigation is required, but the transaction "
            "can continue to be monitored."
        )

    return {
        "summary": "AI investigation completed by CyberShield.",
        "risk_level": risk_level,
        "fraud_score": fraud_score,
        "reason": reason,
        "recommendation": recommendation,
        "evidence": context
    }