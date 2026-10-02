import json
from pathlib import Path

from app.database import SessionLocal
from app.model import Transaction
from app.ai_service import analyze_transaction


BASE_DIR = Path(__file__).resolve().parent
DEMO_FILE = BASE_DIR / "demo_transactions.json"


def seed_demo_transactions():
    with open(DEMO_FILE, "r", encoding="utf-8") as file:
        transactions = json.load(file)

    db = SessionLocal()

    try:
        for item in transactions:
            transaction_data = {
                "merchant_id": item["merchant_id"],
                "amount": item["amount"],
                "merchant_type": item["merchant_type"],
                "location": item["location"],
            }

            prediction = analyze_transaction(transaction_data)

            transaction = Transaction(
                merchant_id=item["merchant_id"],
                amount=item["amount"],
                raw_payload={
                    "merchant_type": item["merchant_type"],
                    "location": item["location"],
                },
                risk_score=prediction["fraud_score"],
                risk_band=prediction["status"],
                explanation=prediction["reason"],
            )

            db.add(transaction)

        db.commit()
        print(f"Added {len(transactions)} demo transactions.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_transactions()