from ml.predict import predict_transaction
from rag.retriever import retrieve_context

def process_transaction(transaction_data):

    # 1. ML fraud detection
    prediction = predict_transaction(transaction_data)

    fraud_score = prediction["fraud_score"]
    status = prediction["status"]

    # 2. Build investigation query
    if status == "suspicious":
        query = "unusual transaction fraud suspicious merchant timing frequency"
    else:
        query = "fraud investigation transaction guidance"

    # 3. Retrieve relevant knowledge
    context = retrieve_context(query)

    # 4. Generate investigation reason
    if status == "suspicious":
        reason = (
            "The machine learning model detected anomalous "
            "characteristics. Retrieved fraud-investigation "
            "guidance recommends examining multiple transaction signals."
        )
    else:
        reason = (
            "The machine learning model did not detect strong "
            "anomalous characteristics."
        )

    # 5. Create incident report
    report = {
        "summary": "Transaction analyzed using CyberShield.",
        "risk_level": status,
        "fraud_score": fraud_score,
        "reason": reason,
        "investigation_context": context
    }

    return {
        "fraud_score": fraud_score,
        "status": status,
        "reason": reason,
        "report": report
    }
if __name__ == "__main__":
    import pandas as pd

    df = pd.read_csv("AI/DataSet.csv")

    transaction = df.drop(columns=["F3924"]).iloc[0].to_dict()

    result = process_transaction(transaction)

    print("\nCyberShield Result:")
    print(result)