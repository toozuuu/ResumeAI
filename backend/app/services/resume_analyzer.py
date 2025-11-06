from app.services.ai_service import analyze_resume_match, rewrite_section
import PyPDF2
import io
from docx import Document
import json

async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from uploaded resume file"""
    
    if filename.endswith('.pdf'):
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
    
    elif filename.endswith('.docx'):
        try:
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")
    
    elif filename.endswith('.txt'):
        try:
            return file_content.decode('utf-8')
        except:
            return file_content.decode('latin-1')
    
    else:
        raise Exception(f"Unsupported file type: {filename}")

async def analyze_resume(resume_text: str, job_description: str) -> dict:
    """Analyze resume and return comprehensive results"""
    
    # Get AI analysis
    ai_result = await analyze_resume_match(resume_text, job_description)
    
    # Get rewritten sections
    rewritten_sections = await get_rewritten_sections(resume_text, job_description)
    
    return {
        "match_score": ai_result.get("match_score", 0),
        "suggestions": ai_result.get("suggestions", []),
        "keywords_missing": ai_result.get("keywords_missing", []),
        "keywords_present": ai_result.get("keywords_present", []),
        "rewritten_sections": rewritten_sections,
        "resume_text": resume_text,  # Store for cover letter generation
        "job_description": job_description  # Store for cover letter generation
    }

async def get_rewritten_sections(resume_text: str, job_description: str) -> dict:
    """Get rewritten versions of key resume sections"""
    
    # Extract common sections (simplified - in production, use NLP)
    sections_to_rewrite = {
        "summary": resume_text[:500] if len(resume_text) > 500 else resume_text,
        "skills": extract_skills_section(resume_text),
    }
    
    rewritten = {}
    for section_name, section_text in sections_to_rewrite.items():
        if section_text:
            try:
                rewritten_text = await rewrite_section(
                    section_text, resume_text, job_description
                )
                # Only use rewritten text if it's not an error message
                if rewritten_text and not rewritten_text.startswith("Error"):
                    rewritten[section_name] = rewritten_text
                else:
                    rewritten[section_name] = section_text
            except Exception as e:
                print(f"Error rewriting {section_name}: {e}")
                rewritten[section_name] = section_text
    
    return rewritten

def extract_skills_section(text: str) -> str:
    """Extract skills section from resume text"""
    # Simple keyword-based extraction
    skills_keywords = ["skills", "technical skills", "core competencies", "expertise"]
    lines = text.lower().split("\n")
    
    for i, line in enumerate(lines):
        if any(keyword in line for keyword in skills_keywords):
            # Get next few lines as skills
            skills_lines = lines[i:min(i+10, len(lines))]
            return "\n".join(skills_lines)
    
    return ""

