from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    merchant_id = Column(String, index=True)
    amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_payload = Column(JSONB)

    risk_score = Column(Float, nullable=True)
    risk_band = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    top_features = Column(JSONB, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)