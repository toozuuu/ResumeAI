import requests
from bs4 import BeautifulSoup
import re

async def scrape_job_description(job_url: str) -> str:
    """Scrape job description from common job board URLs"""
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(job_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Try to find job description in common class names
        job_selectors = [
            'div[class*="job-description"]',
            'div[class*="jobDescription"]',
            'div[class*="description"]',
            'div[id*="description"]',
            'section[class*="description"]',
            'div[data-testid*="description"]'
        ]
        
        for selector in job_selectors:
            elements = soup.select(selector)
            if elements:
                text = " ".join([elem.get_text(separator=" ", strip=True) for elem in elements])
                if len(text) > 200:  # Valid job description should be substantial
                    return clean_text(text)
        
        # Fallback: get all text
        text = soup.get_text(separator=" ", strip=True)
        return clean_text(text)
        
    except Exception as e:
        raise Exception(f"Error scraping job description: {str(e)}")

def clean_text(text: str) -> str:
    """Clean and normalize scraped text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s.,;:!?()\-]', '', text)
    return text.strip()

