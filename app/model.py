from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from datetime import datetime
import uuid
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    merchant_id = Column(String, index=True)
    amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    raw_payload = Column(JSON)

    risk_score = Column(Float, nullable=True)
    risk_band = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    top_features = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)