# Windows Setup Guide

## Backend Setup (Windows PowerShell)

1. **Create virtual environment:**
```powershell
python -m venv venv
```

2. **Activate virtual environment:**
```powershell
.\venv\Scripts\activate
```

You should see `(venv)` at the beginning of your prompt.

3. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

4. **Create .env file:**
Copy the example file and edit it:
```powershell
copy .env.example .env
```

Then edit `.env` and add your API keys:
```env
# Get your free Gemini API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./resume_assistant.db
FRONTEND_URL=http://localhost:3000
```

5. **Run the server:**
```powershell
python main.py
```

Or use uvicorn directly:
```powershell
uvicorn main:app --reload --port 8000
```

## Frontend Setup (Windows)

1. **Navigate to frontend directory:**
```powershell
cd ..\frontend
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Create .env file:**
Create a file named `.env` in the `frontend` directory (see `.env.example` for template)

4. **Start development server:**
```powershell
npm start
```

## Troubleshooting

- If `python` command doesn't work, try `py` instead
- If you get permission errors, run PowerShell as Administrator
- Make sure Node.js is installed for frontend development

