# Quick Start Guide

## 🚀 Running the Project

### Backend (Terminal 1)
```powershell
cd backend
.\venv\Scripts\activate
python main.py
```

The backend should start on: **http://localhost:8000**

### Frontend (Terminal 2)
```powershell
cd frontend
npm start
```

The frontend should start on: **http://localhost:3000**

## ⚠️ Current Status

The app is running in **Demo Mode** because:
- Firebase is not configured (authentication)
- Stripe is not configured (payments)

This is **perfectly fine for testing**! All features work except:
- Real user authentication (uses demo user)
- Real payment processing

## ✅ What Works in Demo Mode

- ✅ Resume analysis with AI (Gemini)
- ✅ Job description scraping
- ✅ Match score calculation
- ✅ Keyword analysis
- ✅ Improvement suggestions
- ✅ AI-powered section rewriting
- ✅ Cover letter generation
- ✅ File upload (PDF, DOCX, TXT)

## 🔧 Troubleshooting

### Backend not starting?
- Check if port 8000 is already in use
- Make sure virtual environment is activated
- Check `.env` file exists in `backend/` folder

### Frontend errors?
- Clear browser cache (Ctrl+F5)
- Check if backend is running on port 8000
- Check browser console for specific errors

### Connection Refused?
- Make sure backend is running before using frontend
- Check firewall isn't blocking port 8000

## 📝 Next Steps

1. **Test the app** - Try analyzing a resume!
2. **Set up Firebase** (optional) - See `frontend/README_FIREBASE_SETUP.md`
3. **Set up Stripe** (optional) - For payment processing

## 🎯 Test It Now!

1. Go to http://localhost:3000
2. Click "Get Started" or go to Dashboard
3. Paste your resume text
4. Paste a job description
5. Click "Analyze Resume"

The AI will analyze your resume and provide suggestions!

