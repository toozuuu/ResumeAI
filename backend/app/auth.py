import firebase_admin
from firebase_admin import credentials, auth
from sqlalchemy.orm import Session
from app.models import User
from datetime import datetime, timedelta
import os

# Initialize Firebase Admin
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    # For development, use default credentials or skip
    try:
        firebase_admin.initialize_app()
    except:
        pass

async def verify_token(token: str) -> dict:
    """Verify Firebase ID token"""
    # Allow demo token for testing
    if token == "demo-token-123":
        return {
            "uid": "demo-user-123",
            "email": "demo@example.com"
        }
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid token: {str(e)}")

async def get_current_user(token: str, db: Session) -> User:
    """Get or create user from Firebase token"""
    try:
        decoded_token = await verify_token(token)
        firebase_uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        
        if not firebase_uid:
            raise Exception("Invalid token")
        
        # Get or create user
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        if not user:
            user = User(
                firebase_uid=firebase_uid,
                email=email,
                subscription_tier="free",
                usage_count=0,
                usage_reset_date=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Reset usage if it's been more than 30 days or if it's the demo user
            if firebase_uid == "demo-user-123" or (datetime.utcnow() > user.usage_reset_date + timedelta(days=30)):
                user.usage_count = 0
                user.usage_reset_date = datetime.utcnow()
                db.commit()
                db.refresh(user)
        
        return user
    except Exception as e:
        raise Exception(f"Authentication failed: {str(e)}")

