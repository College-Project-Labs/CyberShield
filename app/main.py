from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app.model import Transaction
from app.schemas import TransactionIn, TransactionOut
from app.ai_service import analyze_transaction


app = FastAPI(title="CyberShield API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "CyberShield API is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/transaction", response_model=TransactionOut)
def create_transaction(
    transaction: TransactionIn,
    db: Session = Depends(get_db)
):
    # Convert API transaction into a dictionary.
    transaction_data = {
        "merchant_id": transaction.merchant_id,
        "amount": transaction.amount,
        "timestamp": transaction.timestamp.isoformat(),
    }

    if transaction.raw_payload:
        transaction_data.update(transaction.raw_payload)

    # Run the real ML model.
    prediction = analyze_transaction(transaction_data)

    fraud_score = prediction["fraud_score"]
    status = prediction["status"]

    # Store the result in our database.
    db_transaction = Transaction(
        merchant_id=transaction.merchant_id,
        amount=transaction.amount,
        timestamp=transaction.timestamp,
        raw_payload=transaction.raw_payload,
        risk_score=fraud_score,
        risk_band=status,
        explanation=(
            "Transaction analyzed by the CyberShield ML fraud detector."
        ),
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@app.get("/transactions", response_model=list[TransactionOut])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(
        Transaction.created_at.desc()
    ).all()


@app.get("/alerts", response_model=list[TransactionOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Transaction).filter(
        Transaction.risk_band.in_(["suspicious", "fraud"])
    ).order_by(
        Transaction.created_at.desc()
    ).all()


@app.get("/transactions/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction