from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any

class TransactionIn(BaseModel):
    merchant_id: str
    amount: float
    timestamp: datetime
    raw_payload: Optional[dict] = None

class TransactionOut(TransactionIn):
    id: str
    risk_score: Optional[float] = None
    risk_band: Optional[str] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True