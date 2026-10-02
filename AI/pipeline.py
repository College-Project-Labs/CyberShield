from ml.predict import predict_transaction
from rag.retriever import retrieve_context
from agent.assistant import investigate_transaction


def process_transaction(transaction_data):

    prediction = predict_transaction(transaction_data)

    fraud_score = prediction["fraud_score"]
    status = prediction["status"]

    query = (
        "unusual transaction fraud suspicious "
        "merchant timing frequency"
    )
    context = retrieve_context(query)

    # 4. AI investigation
    investigation = investigate_transaction(
        transaction_data,
        prediction,
        context
    )
    return {
        "fraud_score": fraud_score,
        "status": status,
        "reason": investigation["reason"],
        "report": investigation
    }


if __name__ == "__main__":

    import pandas as pd

    df = pd.read_csv("AI/DataSet.csv")

    transaction = df.drop(columns=["F3924"]).iloc[0].to_dict()

    result = process_transaction(transaction)

    print("\nCyberShield Result:")
    print(result)