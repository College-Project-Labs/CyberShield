from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Any


class TransactionIn(BaseModel):
    merchant_id: str
    amount: float
    timestamp: datetime
    raw_payload: Optional[dict[str, Any]] = None


class InvestigationReport(BaseModel):
    summary: str
    risk_level: str
    fraud_score: float
    reason: str
    recommendation: str
    evidence: str


class TransactionOut(TransactionIn):
    id: str
    risk_score: Optional[float] = None
    risk_band: Optional[str] = None
    explanation: Optional[str] = None
    report: Optional[InvestigationReport] = None

    model_config = ConfigDict(from_attributes=True)
