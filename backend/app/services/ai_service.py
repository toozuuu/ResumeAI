import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is required. Please set it in your .env file.")
genai.configure(api_key=api_key)

# Cache the model name to avoid querying API on every request
_cached_model_name = None

# Helper function to get available model
def get_available_model():
    """Get the first available Gemini model"""
    global _cached_model_name
    
    # Return cached model if available
    if _cached_model_name:
        return _cached_model_name
    
    try:
        # List available models from API and find a working one
        # Convert to list immediately to avoid iterator issues
        try:
            models_iter = genai.list_models()
            models_list = [m for m in models_iter]
        except Exception as list_error:
            print(f"Error listing models: {list_error}")
            _cached_model_name = 'models/gemini-2.5-flash'
            return _cached_model_name
        
        if not models_list or len(models_list) == 0:
            # No models available, use fallback
            _cached_model_name = 'models/gemini-2.5-flash'
            return _cached_model_name
        
        preferred_models = [
            'models/gemini-2.5-flash',  # Stable, fast
            'models/gemini-2.0-flash-001',  # Stable
            'models/gemini-flash-latest',  # Latest
            'models/gemini-2.5-flash-lite',  # Lightweight
            'models/gemini-2.5-pro',  # More capable
            'models/gemini-pro-latest'  # Latest pro
        ]
        
        # Try preferred models first
        for pref_model in preferred_models:
            for i, model in enumerate(models_list):
                try:
                    if hasattr(model, 'name') and model.name == pref_model:
                        if hasattr(model, 'supported_generation_methods'):
                            methods = model.supported_generation_methods
                            if methods and 'generateContent' in methods:
                                _cached_model_name = pref_model
                                return pref_model
                except (IndexError, AttributeError) as e:
                    print(f"Error checking model {i}: {e}")
                    continue
        
        # Fallback: Get first available Gemini model
        for i, model in enumerate(models_list):
            try:
                if hasattr(model, 'name') and hasattr(model, 'supported_generation_methods'):
                    name = model.name
                    methods = model.supported_generation_methods
                    if methods and 'generateContent' in methods and 'gemini' in name.lower():
                        _cached_model_name = name
                        return name
            except (IndexError, AttributeError) as e:
                print(f"Error checking fallback model {i}: {e}")
                continue
        
        # Last resort fallback
        _cached_model_name = 'models/gemini-2.5-flash'
        return _cached_model_name
    except Exception as e:
        import traceback
        print(f"Error getting model: {e}")
        print(traceback.format_exc())
        # Last resort fallback
        _cached_model_name = 'models/gemini-2.5-flash'
        return _cached_model_name

async def analyze_resume_match(resume_text: str, job_description: str) -> dict:
    """Analyze resume against job description using Gemini"""
    
    # Limit text length to avoid token limits
    # Gemini has limits, so truncate if too long
    max_resume_length = 5000
    max_job_length = 3000
    
    truncated_resume = resume_text[:max_resume_length] if len(resume_text) > max_resume_length else resume_text
    truncated_job = job_description[:max_job_length] if len(job_description) > max_job_length else job_description
    
    prompt = f"""Analyze this resume against the job description and provide:
1. A match score (0-100)
2. Missing keywords that should be added
3. Keywords that are present
4. Specific improvement suggestions

Resume:
{truncated_resume}

Job Description:
{truncated_job}

Return your response as JSON with this structure:
{{
    "match_score": 85,
    "keywords_missing": ["Python", "Docker", "AWS"],
    "keywords_present": ["React", "JavaScript", "Node.js"],
    "suggestions": [
        "Add Python experience to your skills section",
        "Include Docker in your technical skills",
        "Highlight AWS experience if you have any"
    ]
}}

Return ONLY valid JSON, no other text."""
    
    try:
        # Get available model dynamically
        model_name = get_available_model()
        model = genai.GenerativeModel(model_name)
        # Configure safety settings to allow content (disable blocking)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1000,
            },
            safety_settings=safety_settings
        )
        
        # Extract text from response - response.text should work
        # If it raises IndexError, it means the response is blocked/empty
        try:
            content = response.text.strip()
            if not content:
                raise ValueError("Empty response from Gemini")
        except (IndexError, AttributeError) as e:
            # IndexError means response was blocked or empty
            # Try to get blocking info
            blocked_reason = "Response blocked or empty"
            try:
                if hasattr(response, 'candidates') and response.candidates:
                    for candidate in response.candidates:
                        if hasattr(candidate, 'finish_reason'):
                            finish_reason = str(candidate.finish_reason)
                            if 'SAFETY' in finish_reason or finish_reason in ['1', '2', '3', '4']:
                                blocked_reason = f"Blocked by safety filter (finish_reason: {finish_reason})"
                                break
                        # Try to get content from parts directly as fallback
                        if hasattr(candidate, 'content') and candidate.content:
                            if hasattr(candidate.content, 'parts') and candidate.content.parts:
                                for part in candidate.content.parts:
                                    if hasattr(part, 'text') and part.text:
                                        content = str(part.text).strip()
                                        if content:
                                            print("Got content from candidate.content.parts fallback")
                                            break
                        if content:
                            break
            except Exception as check_err:
                print(f"Error checking response: {check_err}")
            
            if not content:
                raise Exception(f"{blocked_reason}: {str(e)}")
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        # Try to parse JSON
        try:
            result = json.loads(content)
            # Validate result has required fields
            if not isinstance(result, dict):
                raise ValueError("Response is not a JSON object")
            if 'match_score' not in result:
                result['match_score'] = 0
            if 'suggestions' not in result:
                result['suggestions'] = []
            if 'keywords_missing' not in result:
                result['keywords_missing'] = []
            if 'keywords_present' not in result:
                result['keywords_present'] = []
            return result
        except json.JSONDecodeError as e:
            # Try to extract JSON from response using regex
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                    # Validate result
                    if not isinstance(result, dict):
                        raise ValueError("Extracted JSON is not an object")
                    if 'match_score' not in result:
                        result['match_score'] = 0
                    if 'suggestions' not in result:
                        result['suggestions'] = []
                    if 'keywords_missing' not in result:
                        result['keywords_missing'] = []
                    if 'keywords_present' not in result:
                        result['keywords_present'] = []
                    return result
                except Exception as parse_error:
                    raise Exception(f"Could not parse extracted JSON: {str(parse_error)}")
            else:
                raise Exception(f"Could not find JSON in response: {content[:200]}")
        
    except json.JSONDecodeError as e:
        # Try to extract JSON from response
        try:
            # Find JSON object in response
            start = content.find('{')
            end = content.rfind('}') + 1
            if start >= 0 and end > start:
                result = json.loads(content[start:end])
                return result
        except:
            pass
        
        # Fallback to basic analysis
        return {
            "match_score": 70.0,
            "keywords_missing": [],
            "keywords_present": [],
            "suggestions": [f"Error parsing AI response. Please try again."]
        }
    except Exception as e:
        # Fallback to basic analysis
        return {
            "match_score": 70.0,
            "keywords_missing": [],
            "keywords_present": [],
            "suggestions": [f"Error in AI analysis: {str(e)}. Please try again."]
        }

async def rewrite_section(section: str, resume_text: str, job_description: str) -> str:
    """Rewrite a resume section using Gemini"""
    
    prompt = f"""You are a professional resume writer. Rewrite the following resume section to better match this job description.
Make it more compelling and aligned with the job requirements while keeping it truthful.

Current Resume Section:
{section}

Full Resume Context:
{resume_text[:1000]}

Job Description:
{job_description}

Return only the rewritten section, no explanations."""
    
    try:
        # Get available model dynamically
        model_name = get_available_model()
        model = genai.GenerativeModel(model_name)
        # Configure safety settings to allow content (disable blocking)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 500,
            },
            safety_settings=safety_settings
        )
        
        # Extract text from response
        try:
            return response.text.strip()
        except AttributeError:
            # Fallback through candidates
            try:
                if hasattr(response, 'candidates') and response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and candidate.content.parts and len(candidate.content.parts) > 0:
                        return candidate.content.parts[0].text.strip()
            except (IndexError, AttributeError) as e:
                return f"Error extracting text: {str(e)}"
        return f"Error: Could not extract text from Gemini response"
        
    except Exception as e:
        return f"Error rewriting section: {str(e)}"

async def generate_cover_letter(
    resume_text: str,
    job_description: str,
    recipient_name: Optional[str] = None,
    company_name: Optional[str] = None
) -> str:
    """Generate a cover letter using Gemini"""
    
    greeting = f"Dear {recipient_name}," if recipient_name else "Dear Hiring Manager,"
    
    prompt = f"""You are a professional cover letter writer. Write a compelling cover letter for this job application.

Resume:
{resume_text[:2000]}

Job Description:
{job_description}

Recipient: {recipient_name or "Hiring Manager"}
Company: {company_name or "Company"}

Write a compelling cover letter that:
1. Highlights relevant experience from the resume
2. Shows how the candidate matches the job requirements
3. Demonstrates enthusiasm for the role
4. Is professional but personable

Start with: {greeting}"""
    
    try:
        # Get available model dynamically
        model_name = get_available_model()
        model = genai.GenerativeModel(model_name)
        
        # Configure safety settings to allow content (disable blocking)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 800,
            },
            safety_settings=safety_settings
        )
        
        # Extract text from response
        try:
            return response.text.strip()
        except (AttributeError, IndexError) as e:
            # Fallback through candidates
            try:
                if hasattr(response, 'candidates') and response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and candidate.content.parts and len(candidate.content.parts) > 0:
                        return candidate.content.parts[0].text.strip()
            except (IndexError, AttributeError) as fallback_error:
                return f"Error extracting text: {str(e)} (fallback: {str(fallback_error)})"
        return f"Error: Could not extract text from Gemini response"
        
    except Exception as e:
        return f"Error generating cover letter: {str(e)}"

