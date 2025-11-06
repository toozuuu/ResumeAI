from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    subscription_tier = Column(String, default="free")  # free, pro, career_plus
    stripe_customer_id = Column(String, nullable=True)
    usage_count = Column(Integer, default=0)
    usage_reset_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    analyses = relationship("ResumeAnalysis", back_populates="user")
    
    def get_usage_limit(self):
        limits = {
            "free": 3,
            "pro": float("inf"),
            "career_plus": float("inf")
        }
        return limits.get(self.subscription_tier, 3)
    
    def get_remaining_analyses(self):
        if self.subscription_tier != "free":
            return "Unlimited"
        limit = self.get_usage_limit()
        remaining = limit - self.usage_count
        return max(0, remaining)
    
    def check_usage_limit(self):
        if self.subscription_tier != "free":
            return True
        
        # Reset usage count monthly
        from datetime import datetime, timedelta
        if datetime.utcnow() > self.usage_reset_date + timedelta(days=30):
            self.usage_count = 0
            self.usage_reset_date = datetime.utcnow()
        
        return self.usage_count < self.get_usage_limit()
    
    def increment_usage(self):
        self.usage_count += 1
        self.updated_at = datetime.utcnow()
    
    def is_pro_user(self):
        return self.subscription_tier in ["pro", "career_plus"]

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    match_score = Column(Float)
    suggestions = Column(Text)  # JSON string
    keywords_missing = Column(Text)  # JSON string
    keywords_present = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="analyses")

