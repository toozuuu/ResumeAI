import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo mode: Create a mock user for testing without Firebase
const createDemoUser = () => ({
  email: 'demo@example.com',
  uid: 'demo-user-123',
  getIdToken: async () => 'demo-token-123'
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured() || !auth);

  useEffect(() => {
    if (isDemoMode || !auth) {
      // Demo mode: Set a mock user
      const demoUser = createDemoUser();
      setCurrentUser(demoUser);
      setToken('demo-token-123');
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          try {
            const idToken = await user.getIdToken();
            setToken(idToken);
          } catch (error) {
            console.error('Error getting token:', error);
          }
        } else {
          setCurrentUser(null);
          setToken(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth state error:', error);
      // Fallback to demo mode
      const demoUser = createDemoUser();
      setCurrentUser(demoUser);
      setToken('demo-token-123');
      setLoading(false);
    }
  }, [isDemoMode]);

  const signup = async (email, password) => {
    if (isDemoMode) {
      const demoUser = createDemoUser();
      demoUser.email = email;
      setCurrentUser(demoUser);
      setToken('demo-token-123');
      return { user: demoUser };
    }
    if (!auth) throw new Error('Firebase not configured');
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email, password) => {
    if (isDemoMode) {
      const demoUser = createDemoUser();
      demoUser.email = email;
      setCurrentUser(demoUser);
      setToken('demo-token-123');
      return { user: demoUser };
    }
    if (!auth) throw new Error('Firebase not configured');
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (isDemoMode) {
      const demoUser = createDemoUser();
      setCurrentUser(demoUser);
      setToken('demo-token-123');
      return { user: demoUser };
    }
    if (!auth) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (isDemoMode) {
      setCurrentUser(null);
      setToken(null);
      return;
    }
    if (!auth) return;
    return await signOut(auth);
  };

  const value = {
    currentUser,
    token,
    signup,
    login,
    loginWithGoogle,
    logout,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

