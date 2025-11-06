# Firebase Setup Guide

The app is currently running in **Demo Mode** without Firebase authentication. To enable full authentication features, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "ResumeAI")
4. Follow the setup wizard

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method**
3. Enable:
   - **Email/Password**
   - **Google** (optional, for Google sign-in)

## 3. Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Scroll down to **Your apps**
3. Click the web icon `</>` to add a web app
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object

## 4. Update Frontend .env File

Create or update `frontend/.env` with your Firebase credentials:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 5. Restart the Frontend

After updating `.env`, restart the React app:

```powershell
# Stop the current server (Ctrl+C)
npm start
```

## 6. Backend Firebase Setup (Optional)

For production, you'll also need to set up Firebase Admin SDK:

1. In Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-credentials.json`
4. Update `backend/.env`:
   ```env
   FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
   ```

## Demo Mode Features

While in demo mode:
- ✅ You can test all features
- ✅ Resume analysis works
- ✅ AI features work
- ⚠️ User data is not persisted between sessions
- ⚠️ No real authentication (any email/password works)

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Setup](https://firebase.google.com/docs/auth/web/start)

