from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn

from app.database import SessionLocal, engine, Base
from app.models import User, ResumeAnalysis
from app.services import resume_analyzer, job_scraper, ai_service
from app.auth import verify_token, get_current_user

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeAI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    match_score: float
    suggestions: List[str]
    rewritten_sections: dict
    keywords_missing: List[str]
    keywords_present: List[str]

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    recipient_name: Optional[str] = None
    company_name: Optional[str] = None

class CoverLetterResponse(BaseModel):
    cover_letter: str

@app.get("/")
async def root():
    return {"message": "ResumeAI API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    request: ResumeAnalysisRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Analyze resume against job description"""
    try:
        user = await get_current_user(credentials.credentials, db)
        
        # Check usage limits
        if not user.check_usage_limit():
            raise HTTPException(status_code=403, detail="Usage limit exceeded. Please upgrade to Pro.")
        
        # Scrape job description if URL provided
        job_description = request.job_description
        if request.job_url and not job_description:
            job_description = await job_scraper.scrape_job_description(request.job_url)
        
        if not job_description:
            raise HTTPException(status_code=400, detail="Job description is required")
        
        # Analyze resume
        analysis = await resume_analyzer.analyze_resume(
            resume_text=request.resume_text,
            job_description=job_description
        )
        
        # Save analysis to database
        import json
        db_analysis = ResumeAnalysis(
            user_id=user.id,
            match_score=analysis["match_score"],
            suggestions=json.dumps(analysis["suggestions"]),
            keywords_missing=json.dumps(analysis["keywords_missing"]),
            keywords_present=json.dumps(analysis["keywords_present"])
        )
        db.add(db_analysis)
        user.increment_usage()
        db.commit()
        
        return ResumeAnalysisResponse(**analysis)
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in analyze_resume endpoint: {error_details}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/rewrite-section")
async def rewrite_section(
    section: str,
    resume_text: str,
    job_description: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Rewrite a specific resume section using AI"""
    try:
        user = await get_current_user(credentials.credentials, db)
        
        if not user.is_pro_user():
            raise HTTPException(status_code=403, detail="Pro subscription required")
        
        rewritten = await ai_service.rewrite_section(
            section=section,
            resume_text=resume_text,
            job_description=job_description
        )
        
        return {"rewritten_section": rewritten}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: CoverLetterRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Generate cover letter using AI"""
    try:
        user = await get_current_user(credentials.credentials, db)
        
        if not user.is_pro_user():
            raise HTTPException(status_code=403, detail="Pro subscription required")
        
        cover_letter = await ai_service.generate_cover_letter(
            resume_text=request.resume_text,
            job_description=request.job_description,
            recipient_name=request.recipient_name,
            company_name=request.company_name
        )
        
        return CoverLetterResponse(cover_letter=cover_letter)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Upload and extract text from resume file"""
    try:
        user = await get_current_user(credentials.credentials, db)
        
        # Extract text from file
        content = await file.read()
        resume_text = await resume_analyzer.extract_text_from_file(
            content, file.filename
        )
        
        return {"resume_text": resume_text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Get user profile and usage stats"""
    try:
        user = await get_current_user(credentials.credentials, db)
        return {
            "email": user.email,
            "subscription": user.subscription_tier,
            "usage_count": user.usage_count,
            "usage_limit": user.get_usage_limit(),
            "remaining_analyses": user.get_remaining_analyses()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/history")
async def get_analysis_history(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: SessionLocal = Depends(lambda: SessionLocal())
):
    """Get user's analysis history"""
    try:
        user = await get_current_user(credentials.credentials, db)
        analyses = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.user_id == user.id
        ).order_by(ResumeAnalysis.created_at.desc()).limit(10).all()
        
        return [{
            "id": a.id,
            "match_score": a.match_score,
            "created_at": a.created_at.isoformat()
        } for a in analyses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

