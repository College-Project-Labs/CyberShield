from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import Base, engine, get_db
from app.model import Transaction
from app.schemas import TransactionIn
from app.ai_service import analyze_transaction

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="CyberShield API",
    description="AI-assisted fraud detection API",
    version="1.0.0"
)

# =========================================================
# FRONTEND
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount(
    "/frontend",
    StaticFiles(directory=FRONTEND_DIR),
    name="frontend"
)


@app.get("/", include_in_schema=False)
async def serve_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CyberShield API"
    }


# =========================================================
# ANALYZE TRANSACTION
# =========================================================

@app.post("/transaction")
def create_transaction(
    payload: TransactionIn,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Prepare data for AI / ML pipeline
    # -----------------------------------------------------

    transaction_data = {
        "merchant_id": payload.merchant_id,
        "amount": payload.amount,
        "timestamp": payload.timestamp,
    }

    if payload.raw_payload:
        transaction_data.update(payload.raw_payload)

    # -----------------------------------------------------
    # Run CyberShield AI pipeline
    # -----------------------------------------------------

    try:
        prediction = analyze_transaction(transaction_data)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"CyberShield analysis failed: {str(error)}"
        )

    # -----------------------------------------------------
    # Extract prediction
    # -----------------------------------------------------

    risk_score = float(
        prediction.get("fraud_score", 0.0)
    )

    risk_band = prediction.get(
        "status",
        "normal"
    )

    explanation = prediction.get(
        "reason",
        "Transaction analyzed by CyberShield ML engine."
    )

    report = prediction.get(
        "report",
        {}
    )

    # -----------------------------------------------------
    # Save transaction to database
    # -----------------------------------------------------

    transaction = Transaction(
        merchant_id=payload.merchant_id,
        amount=payload.amount,
        timestamp=payload.timestamp or datetime.utcnow(),

        raw_payload=payload.raw_payload,

        risk_score=risk_score,
        risk_band=risk_band,

        explanation=explanation,

        top_features=report.get(
            "top_features",
            None
        )
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # =====================================================
    # STRUCTURED INVESTIGATION REPORT
    # =====================================================

    final_report = {
        "summary": report.get(
            "summary",
            "AI investigation completed by CyberShield."
        ),

        "risk_level": (
            "HIGH"
            if risk_score >= 0.5
            else "LOW"
        ),

        "fraud_score": risk_score,

        "reason": report.get(
            "reason",
            explanation or
            "No strong anomalous characteristics were detected."
        ),

        "recommendation": report.get(
            "recommendation",
            (
                "Review the transaction and verify merchant details."
                if risk_score >= 0.5
                else
                "No immediate investigation is required."
            )
        ),

        "evidence": report.get(
            "evidence",
            (
                "ML fraud probability: "
                f"{risk_score:.4f}"
            )
        )
    }

    # =====================================================
    # RESPONSE TO FRONTEND
    # =====================================================

    return {
        "id": transaction.id,
        "merchant_id": transaction.merchant_id,
        "amount": transaction.amount,

        "timestamp": transaction.timestamp,

        "risk_score": float(
            transaction.risk_score or 0.0
        ),

        "risk_band": (
            transaction.risk_band or "normal"
        ),

        "explanation": (
            transaction.explanation
            or
            "Transaction analyzed by CyberShield ML engine."
        ),

        "report": final_report
    }


# =========================================================
# GET ALL TRANSACTIONS
# =========================================================

@app.get("/transactions")
def get_transactions(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    results = []

    for transaction in transactions:

        score = float(
            transaction.risk_score or 0.0
        )

        results.append({
            "id": transaction.id,

            "merchant_id":
                transaction.merchant_id,

            "amount":
                transaction.amount,

            "timestamp":
                transaction.timestamp,

            "created_at":
                transaction.created_at,

            "risk_score":
                score,

            "risk_band":
                transaction.risk_band or "normal",

            "explanation":
                transaction.explanation or
                "Transaction analyzed by CyberShield."
        })

    return results


# =========================================================
# GET ALERTS
# =========================================================

@app.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.risk_score >= 0.5
        )
        .order_by(
            Transaction.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": transaction.id,
            "merchant_id": transaction.merchant_id,
            "amount": transaction.amount,
            "risk_score": float(
                transaction.risk_score or 0.0
            ),
            "risk_band":
                transaction.risk_band or "normal",
            "explanation":
                transaction.explanation or
                "Transaction requires review.",
            "timestamp":
                transaction.timestamp
        }

        for transaction in transactions
    ]


# =========================================================
# GET SINGLE TRANSACTION
# =========================================================

@app.get("/transactions/{transaction_id}")
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db)
):

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    score = float(
        transaction.risk_score or 0.0
    )

    return {
        "id": transaction.id,

        "merchant_id":
            transaction.merchant_id,

        "amount":
            transaction.amount,

        "timestamp":
            transaction.timestamp,

        "created_at":
            transaction.created_at,

        "raw_payload":
            transaction.raw_payload,

        "risk_score":
            score,

        "risk_band":
            transaction.risk_band or "normal",

        "explanation":
            transaction.explanation or
            "Transaction analyzed by CyberShield.",

        "report": {
            "summary":
                "AI investigation completed by CyberShield.",

            "risk_level":
                "HIGH" if score >= 0.5 else "LOW",

            "fraud_score":
                score,

            "reason":
                transaction.explanation or
                "No strong anomalous characteristics were detected.",

            "recommendation":
                (
                    "Review the transaction and verify merchant details."
                    if score >= 0.5
                    else
                    "No immediate investigation is required."
                ),

            "evidence":
                f"ML fraud probability: {score:.4f}"
        }
    }