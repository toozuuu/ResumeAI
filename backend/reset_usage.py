"""Script to reset user usage limits"""
import sys
from app.database import SessionLocal, engine, Base
from app.models import User
from datetime import datetime

# Create database session
db = SessionLocal()

try:
    # Get demo user
    demo_user = db.query(User).filter(User.firebase_uid == "demo-user-123").first()
    
    if not demo_user:
        # Create demo user if doesn't exist
        demo_user = User(
            email="demo@example.com",
            firebase_uid="demo-user-123",
            subscription_tier="free",
            usage_count=0,
            usage_reset_date=datetime.utcnow()
        )
        db.add(demo_user)
        print("Created demo user")
    else:
        # Reset usage count
        demo_user.usage_count = 0
        demo_user.usage_reset_date = datetime.utcnow()
        print(f"Reset usage for user: {demo_user.email}")
        print(f"  Previous usage: {demo_user.usage_count}")
    
    # Commit changes
    db.commit()
    
    # Refresh and show status
    db.refresh(demo_user)
    print(f"\nCurrent status:")
    print(f"  Email: {demo_user.email}")
    print(f"  Subscription: {demo_user.subscription_tier}")
    print(f"  Usage count: {demo_user.usage_count}")
    print(f"  Remaining analyses: {demo_user.get_remaining_analyses()}")
    print("\nUsage reset successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
    sys.exit(1)
finally:
    db.close()

